import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@/generated/prisma/client";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { programInputSchema, type ProgramInput } from "./validation";

export async function listCmsPrograms(locale: "id" | "en") {
  return db.program.findMany({
    where: { locale },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, tag: true, published: true, image: true, sortOrder: true, updatedAt: true, summary: true },
  });
}

export async function getProgramForEdit(id: string) {
  return db.program.findUnique({ where: { id } });
}

export async function countPrograms() {
  const [published, total] = await Promise.all([db.program.count({ where: { published: true } }), db.program.count()]);
  return { published, total };
}

// Suggestions for the image field: everything already shipped under public/images.
export async function listSiteImages() {
  try {
    const files = await readdir(path.join(process.cwd(), "public", "images"));
    return files.filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file)).map((file) => `/images/${file}`);
  } catch {
    return [];
  }
}

export type ProgramSaveResult =
  | { ok: true; id: string; updatedAt: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveProgram(raw: ProgramInput): Promise<ProgramSaveResult> {
  const parsed = programInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }
  const { id, ...input } = parsed.data;

  const clash = await db.program.findFirst({
    where: { locale: input.locale, slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { ok: false, message: "Another program already uses this slug.", fieldErrors: { slug: "Slug is taken for this language" } };

  const data = { ...input, syllabus: input.syllabus as Prisma.InputJsonValue };

  if (id) {
    const exists = await db.program.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, message: "This program no longer exists." };
    const saved = await db.program.update({ where: { id }, data, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }

  // New programs go to the end of the list for their language.
  const last = await db.program.aggregate({ where: { locale: input.locale }, _max: { sortOrder: true } });
  const saved = await db.program.create({
    data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
    select: { id: true, updatedAt: true },
  });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function deleteProgram(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete a program." };
  const found = await db.program.findUnique({ where: { id }, select: { id: true } });
  if (!found) return { ok: false as const, message: "This program no longer exists." };
  await db.program.delete({ where: { id } });
  return { ok: true as const };
}

// Swaps a program with its neighbour, then renumbers the language so gaps never build up.
export async function moveProgram(id: string, direction: "up" | "down") {
  const program = await db.program.findUnique({ where: { id }, select: { locale: true } });
  if (!program) return { ok: false as const, message: "This program no longer exists." };
  const rows = await db.program.findMany({
    where: { locale: program.locale },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return { ok: true as const };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.$transaction(rows.map((row, order) => db.program.update({ where: { id: row.id }, data: { sortOrder: order } })));
  return { ok: true as const };
}
