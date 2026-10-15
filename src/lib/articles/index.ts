import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

export const articlesTag = "articles";

const summarySelect = {
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  coverAlt: true,
  category: true,
  readingTime: true,
  publishedAt: true,
  author: { select: { name: true } },
} as const;

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string;
  category: string;
  readingTime: number;
  publishedAt: string;
  author: string | null;
};

// Live means published with a date that has arrived. English only: older Bahasa articles never show.
const live = (now: Date) => ({ locale: "en" as const, status: "published" as const, publishedAt: { lte: now } });

function toSummary(row: { slug: string; title: string; excerpt: string; coverImage: string | null; coverAlt: string | null; category: string; readingTime: number; publishedAt: Date | null; author: { name: string } | null }): ArticleSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    coverAlt: row.coverAlt ?? "",
    category: row.category,
    readingTime: row.readingTime,
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
    author: row.author?.name ?? null,
  };
}

/**
 * Live articles, newest first. Cached for minutes rather than hours so a scheduled article
 * appears soon after its publish time; CMS saves refresh it at once through the `articles` tag.
 */
export async function getPublishedArticles(limit?: number): Promise<ArticleSummary[]> {
  "use cache";
  cacheTag(articlesTag);
  cacheLife("minutes");

  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db.article.findMany({ where: live(new Date()), orderBy: { publishedAt: "desc" }, take: limit, select: summarySelect });
    return rows.map(toSummary);
  } catch (error) {
    console.error("[articles] Not shown:", error instanceof Error ? error.message : error);
    return [];
  }
}

export type PublishedArticle = ArticleSummary & { contentHtml: string; seoTitle: string | null; seoDescription: string | null; noindex: boolean };

export async function getPublishedArticle(slug: string): Promise<PublishedArticle | null> {
  "use cache";
  cacheTag(articlesTag);
  cacheLife("minutes");

  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await db.article.findFirst({
      where: { ...live(new Date()), slug },
      select: { ...summarySelect, contentHtml: true, seoTitle: true, seoDescription: true, noindex: true },
    });
    if (!row) return null;
    return { ...toSummary(row), contentHtml: row.contentHtml, seoTitle: row.seoTitle, seoDescription: row.seoDescription, noindex: row.noindex };
  } catch {
    return null;
  }
}
