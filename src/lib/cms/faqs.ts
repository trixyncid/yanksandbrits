import "server-only";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { faqInputSchema, type FaqInput } from "@/lib/faqs/schema";
import { fieldErrors } from "./validation";

export type FaqSaveResult = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

export const listCmsFaqs = () => db.faq.findMany({ orderBy: order });

export const getFaqForEdit = (id: string) => db.faq.findUnique({ where: { id } });

export async function saveFaq(raw: FaqInput): Promise<FaqSaveResult> {
  const parsed = faqInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, ...data } = parsed.data;

  if (id) {
    if (!(await db.faq.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This question no longer exists." };
    const saved = await db.faq.update({ where: { id }, data, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const last = await db.faq.aggregate({ _max: { sortOrder: true } });
  const saved = await db.faq.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 }, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function deleteFaq(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete a question. Hide it instead." };
  const deleted = await db.faq.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: "This question no longer exists." };
}

// Swaps with the neighbour, then renumbers so gaps never build up.
export async function moveFaq(id: string, direction: "up" | "down") {
  const rows = await db.faq.findMany({ orderBy: order, select: { id: true } });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true as const };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.$transaction(rows.map((row, sortOrder) => db.faq.update({ where: { id: row.id }, data: { sortOrder } })));
  return { ok: true as const };
}
