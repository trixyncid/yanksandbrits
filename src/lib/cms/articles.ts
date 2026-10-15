import "server-only";
import { connection } from "next/server";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import type { Prisma } from "@/generated/prisma/client";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { docText, readingMinutes, sanitizeDoc, wordCount, type DocNode } from "./document";
import { articleExtensions } from "./extensions";
import { articleInputSchema, type ArticleInput } from "./validation";

export type ArticleFilter = "all" | "draft" | "published" | "scheduled";

export const pageSize = 20;

function filterWhere(filter: ArticleFilter, now: Date): Prisma.ArticleWhereInput {
  switch (filter) {
    case "draft":
      return { status: "draft" };
    case "published":
      return { status: "published", publishedAt: { lte: now } };
    case "scheduled":
      return { status: "published", publishedAt: { gt: now } };
    default:
      return {};
  }
}

export async function getDashboardStats() {
  // Counts depend on the current time (scheduled vs published), so never prerender them.
  await connection();
  const now = new Date();
  const [total, drafts, published, scheduled, recent, upcoming] = await Promise.all([
    db.article.count(),
    db.article.count({ where: filterWhere("draft", now) }),
    db.article.count({ where: filterWhere("published", now) }),
    db.article.count({ where: filterWhere("scheduled", now) }),
    db.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: listSelect,
    }),
    db.article.findMany({
      where: filterWhere("scheduled", now),
      orderBy: { publishedAt: "asc" },
      take: 4,
      select: listSelect,
    }),
  ]);
  return { total, drafts, published, scheduled, recent, upcoming, now };
}

const listSelect = {
  id: true,
  title: true,
  slug: true,
  locale: true,
  status: true,
  category: true,
  publishedAt: true,
  updatedAt: true,
  author: { select: { name: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleListItem = Prisma.ArticleGetPayload<{ select: typeof listSelect }>;

export async function listArticles({
  filter,
  query,
  page,
}: {
  filter: ArticleFilter;
  query: string;
  page: number;
}) {
  await connection();
  const now = new Date();
  const where: Prisma.ArticleWhereInput = {
    ...filterWhere(filter, now),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, count] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: listSelect,
    }),
    db.article.count({ where }),
  ]);
  return { items, count, pages: Math.max(1, Math.ceil(count / pageSize)), now };
}

export async function getArticleForEdit(id: string) {
  return db.article.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
}

export async function getCategories() {
  const rows = await db.article.findMany({
    where: { category: { not: "" } },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((row) => row.category);
}

export type SaveResult =
  | { ok: true; id: string; updatedAt: string; publishedAt: string | null }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveArticle(user: CmsUser, raw: ArticleInput): Promise<SaveResult> {
  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;
  const content = sanitizeDoc(input.content as DocNode) ?? { type: "doc", content: [] };

  let contentHtml: string;
  try {
    contentHtml = renderToHTMLString({ content, extensions: articleExtensions });
  } catch {
    return { ok: false, message: "The article body contains content the editor does not support." };
  }

  const text = docText(content);
  // Publishing without a date means "now". A draft keeps any date it was given.
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : input.status === "published" ? new Date() : null;

  const clash = await db.article.findFirst({
    where: { locale: input.locale, slug: input.slug, ...(input.id ? { NOT: { id: input.id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, message: "Another article already uses this slug.", fieldErrors: { slug: "Slug is taken for this language" } };
  }

  const data = {
    locale: input.locale,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: content as Prisma.InputJsonValue,
    contentHtml,
    coverImage: input.coverImage,
    coverAlt: input.coverAlt,
    category: input.category,
    tags: [...new Set(input.tags)],
    readingTime: readingMinutes(wordCount(text)),
    status: input.status,
    publishedAt,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    noindex: input.noindex,
  } satisfies Prisma.ArticleUncheckedUpdateInput;

  if (input.id) {
    const existing = await db.article.findUnique({ where: { id: input.id }, select: { id: true } });
    if (!existing) return { ok: false, message: "This article no longer exists." };
    const saved = await db.article.update({ where: { id: input.id }, data, select: savedSelect });
    return savedResult(saved);
  }

  const saved = await db.article.create({
    data: { ...data, authorId: user.id },
    select: savedSelect,
  });
  return savedResult(saved);
}

const savedSelect = { id: true, updatedAt: true, publishedAt: true } satisfies Prisma.ArticleSelect;

function savedResult(saved: { id: string; updatedAt: Date; publishedAt: Date | null }): SaveResult {
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString(), publishedAt: saved.publishedAt?.toISOString() ?? null };
}

export async function deleteArticle(user: CmsUser, id: string) {
  const article = await db.article.findUnique({ where: { id }, select: { authorId: true } });
  if (!article) return { ok: false as const, message: "This article no longer exists." };
  if (user.role !== "admin" && article.authorId !== user.id) {
    return { ok: false as const, message: "Only an admin or the author can delete this article." };
  }
  await db.article.delete({ where: { id } });
  return { ok: true as const };
}
