import "server-only";
import { auth } from "@/lib/auth";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { newUserSchema } from "./validation";

export async function listUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { articles: true } } },
  });
}

// Public sign-up is off, so accounts are written through Better Auth's internal adapter.
// That keeps password hashing and the account row in Better Auth's format.
export async function createUser(raw: unknown) {
  const parsed = newUserSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false as const, message: "Check the highlighted fields.", fieldErrors };
  }
  const { name, email, password, role } = parsed.data;
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) {
    return { ok: false as const, message: "An account with this email already exists.", fieldErrors: { email: "Already in use" } };
  }
  const user = await ctx.internalAdapter.createUser({ name, email, emailVerified: true, role }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  return { ok: true as const, id: user.id };
}

export async function removeUser(actor: CmsUser, id: string) {
  if (actor.id === id) return { ok: false as const, message: "You cannot remove your own account." };
  const target = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { ok: false as const, message: "This account no longer exists." };
  if (target.role === "admin" && (await db.user.count({ where: { role: "admin" } })) <= 1) {
    return { ok: false as const, message: "Keep at least one admin." };
  }
  // Sessions and accounts cascade. Articles keep their content with no author.
  await db.user.delete({ where: { id } });
  return { ok: true as const };
}

// No look-alike characters (0/O, 1/l/I), so the password survives being read out or retyped.
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** A random temporary password in four groups, e.g. "Kx7p-Qm4r-Zt9w-Hn2c" (about 93 bits). */
export function temporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint32Array(16));
  const chars = [...bytes].map((value) => alphabet[value % alphabet.length]);
  return [0, 4, 8, 12].map((start) => chars.slice(start, start + 4).join("")).join("-");
}

/**
 * An admin gives an editor a new temporary password. The old one stops working and every session the
 * editor had is ended. Admins change their own password under Account; other admins cannot be reset here.
 */
export async function resetUserPassword(actor: CmsUser, id: string) {
  if (actor.role !== "admin") return { ok: false as const, message: "Only an admin can reset a password." };
  if (actor.id === id) return { ok: false as const, message: "Change your own password under Account." };
  const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true, email: true, accounts: { where: { providerId: "credential" }, select: { id: true } } } });
  if (!target) return { ok: false as const, message: "This account no longer exists." };
  if (target.role !== "editor") return { ok: false as const, message: "Only editors' passwords can be reset here." };

  const password = temporaryPassword();
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  if (target.accounts.length) await ctx.internalAdapter.updatePassword(target.id, hash);
  else await ctx.internalAdapter.linkAccount({ userId: target.id, providerId: "credential", accountId: target.id, password: hash });
  await ctx.internalAdapter.deleteUserSessions(target.id);
  console.info("[users] Password reset", { target: target.email, by: actor.email });
  return { ok: true as const, password };
}
