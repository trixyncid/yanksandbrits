import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { fieldErrors } from "@/lib/cms/validation";
import { defaultHomeContent } from "./defaults";
import { homeContentSchema, type HomeContent } from "./schema";

export { defaultHomeContent };

export const homeTag = "home";
const key = "home";

/** The home page's editable content. Cached; Homepage editor saves refresh it through the `home` tag. */
export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheTag(homeTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return defaultHomeContent();
  try {
    const row = await db.siteContent.findUnique({ where: { key } });
    if (!row) return defaultHomeContent();
    const parsed = homeContentSchema.safeParse(row.data);
    if (parsed.success) return parsed.data;
    console.error("[home] Stored homepage content is invalid; showing the defaults.", fieldErrors(parsed.error.issues));
    return defaultHomeContent();
  } catch (error) {
    console.error("[home] Falling back to default homepage content:", error instanceof Error ? error.message : error);
    return defaultHomeContent();
  }
}

/** For the editor: what is stored, or the defaults if nothing is yet. Never cached. */
export async function getHomeContentForEdit(): Promise<{ content: HomeContent; updatedAt: string | null }> {
  const row = await db.siteContent.findUnique({ where: { key } });
  const parsed = row ? homeContentSchema.safeParse(row.data) : null;
  return { content: parsed?.success ? parsed.data : defaultHomeContent(), updatedAt: row?.updatedAt.toISOString() ?? null };
}

export type HomeSaveResult = { ok: true; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveHomeContent(raw: unknown): Promise<HomeSaveResult> {
  const parsed = homeContentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const content = parsed.data;
  if (content.hero.highlight && !content.hero.title.toLowerCase().includes(content.hero.highlight.toLowerCase())) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { "hero.highlight": "Use words that appear in the headline" } };
  }
  if (Boolean(content.why.badgeValue) !== Boolean(content.why.badgeLabel)) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { "why.badgeLabel": "Fill in both the number and its label, or neither" } };
  }
  const data = content as unknown as Prisma.InputJsonValue;
  const saved = await db.siteContent.upsert({ where: { key }, create: { key, data }, update: { data }, select: { updatedAt: true } });
  return { ok: true, updatedAt: saved.updatedAt.toISOString() };
}
