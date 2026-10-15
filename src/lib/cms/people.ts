import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { counsellorInputSchema, fieldErrors, tutorInputSchema, type CounsellorInput, type TutorInput } from "./validation";

export type PersonSaveResult = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const listSelect = { id: true, slug: true, name: true, photo: true, published: true, sortOrder: true, updatedAt: true, content: true } as const;

export async function listCounsellors() {
  return db.counsellor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { ...listSelect, onDesk: true } });
}

export async function listTutors() {
  return db.tutor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { ...listSelect, featured: true } });
}

export const getCounsellorForEdit = (id: string) => db.counsellor.findUnique({ where: { id } });
export const getTutorForEdit = (id: string) => db.tutor.findUnique({ where: { id } });

export async function saveCounsellor(raw: CounsellorInput): Promise<PersonSaveResult> {
  const parsed = counsellorInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, ...data } = parsed.data;
  const clash = await db.counsellor.findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, message: "Another counsellor already uses this slug.", fieldErrors: { slug: "Slug is taken" } };
  const values = { ...data, content: data.content as Prisma.InputJsonValue };
  if (id) {
    if (!(await db.counsellor.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This counsellor no longer exists." };
    const saved = await db.counsellor.update({ where: { id }, data: values, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const last = await db.counsellor.aggregate({ _max: { sortOrder: true } });
  const saved = await db.counsellor.create({ data: { ...values, sortOrder: (last._max.sortOrder ?? -1) + 1 }, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function saveTutor(raw: TutorInput): Promise<PersonSaveResult> {
  const parsed = tutorInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, ...data } = parsed.data;
  const clash = await db.tutor.findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, message: "Another tutor already uses this slug.", fieldErrors: { slug: "Slug is taken" } };
  const values = { ...data, content: data.content as Prisma.InputJsonValue };
  if (id) {
    if (!(await db.tutor.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This tutor no longer exists." };
    const saved = await db.tutor.update({ where: { id }, data: values, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const last = await db.tutor.aggregate({ _max: { sortOrder: true } });
  const saved = await db.tutor.create({ data: { ...values, sortOrder: (last._max.sortOrder ?? -1) + 1 }, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function deletePerson(user: CmsUser, kind: "counsellor" | "tutor", id: string) {
  if (user.role !== "admin") return { ok: false as const, message: `Only an admin can delete a ${kind}.` };
  const deleted = kind === "counsellor" ? await db.counsellor.deleteMany({ where: { id } }) : await db.tutor.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: `This ${kind} no longer exists.` };
}

// Swaps with the neighbour, then renumbers so gaps never build up.
export async function movePerson(kind: "counsellor" | "tutor", id: string, direction: "up" | "down") {
  const rows =
    kind === "counsellor"
      ? await db.counsellor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true } })
      : await db.tutor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true } });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true as const };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.$transaction(
    rows.map((row, sortOrder) =>
      kind === "counsellor" ? db.counsellor.update({ where: { id: row.id }, data: { sortOrder } }) : db.tutor.update({ where: { id: row.id }, data: { sortOrder } }),
    ),
  );
  return { ok: true as const };
}
