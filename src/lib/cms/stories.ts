import "server-only";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { storyInputSchema, type StoryInput } from "@/lib/stories/schema";
import { fieldErrors } from "./validation";

export type StorySaveResult = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

export const listCmsStories = () => db.story.findMany({ orderBy: order });

export const getStoryForEdit = (id: string) => db.story.findUnique({ where: { id } });

export async function saveStory(raw: StoryInput): Promise<StorySaveResult> {
  const parsed = storyInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, ...data } = parsed.data;
  const clash = await db.story.findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, message: "Another story already uses this slug.", fieldErrors: { slug: "Slug is taken" } };

  if (id) {
    if (!(await db.story.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This story no longer exists." };
    const saved = await db.story.update({ where: { id }, data, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const last = await db.story.aggregate({ _max: { sortOrder: true } });
  const saved = await db.story.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 }, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

export async function deleteStory(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete a story. Hide it instead." };
  const deleted = await db.story.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: "This story no longer exists." };
}

// Swaps with the neighbour, then renumbers so gaps never build up.
export async function moveStory(id: string, direction: "up" | "down") {
  const rows = await db.story.findMany({ orderBy: order, select: { id: true } });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true as const };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.$transaction(rows.map((row, sortOrder) => db.story.update({ where: { id: row.id }, data: { sortOrder } })));
  return { ok: true as const };
}
