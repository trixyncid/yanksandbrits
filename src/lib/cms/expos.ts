import "server-only";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { expoInputSchema, type ExpoInput } from "@/lib/expos/schema";
import { fieldErrors } from "./validation";

export type ExpoSaveResult = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

export const listCmsExpos = () => db.expo.findMany({ orderBy: order });

export const getExpoForEdit = (id: string) => db.expo.findUnique({ where: { id } });

export async function saveExpo(raw: ExpoInput): Promise<ExpoSaveResult> {
  const parsed = expoInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, startsAt, endsAt, ...rest } = parsed.data;
  const data = { ...rest, city: rest.city || "Medan", startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null };

  const clash = await db.expo.findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, message: "Another expo already uses this slug.", fieldErrors: { slug: "Slug is taken" } };

  if (id) {
    if (!(await db.expo.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This expo no longer exists." };
    const saved = await db.expo.update({ where: { id }, data, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const last = await db.expo.aggregate({ _max: { sortOrder: true } });
  const saved = await db.expo.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 }, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function deleteExpo(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete an expo. Hide it instead." };
  const deleted = await db.expo.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: "This expo no longer exists." };
}

// Swaps with the neighbour, then renumbers so gaps never build up.
export async function moveExpo(id: string, direction: "up" | "down") {
  const rows = await db.expo.findMany({ orderBy: order, select: { id: true } });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true as const };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.$transaction(rows.map((row, sortOrder) => db.expo.update({ where: { id: row.id }, data: { sortOrder } })));
  return { ok: true as const };
}
