import "server-only";
import { db } from "@/lib/db";

export type SearchHit = { id: string; title: string; detail: string; href: string };
export type SearchGroup = { label: string; hits: SearchHit[] };

const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

/** One query across the CMS, grouped by content type. Each group returns at most eight hits. */
export async function searchCms(raw: string): Promise<SearchGroup[]> {
  const q = raw.trim().slice(0, 100);
  if (q.length < 2) return [];
  const take = 8;
  const [articles, programs, tutors, counsellors, ads] = await Promise.all([
    db.article.findMany({
      where: { OR: [{ title: contains(q) }, { slug: contains(q) }, { category: contains(q) }, { tags: { has: q.toLowerCase() } }] },
      orderBy: { updatedAt: "desc" },
      take,
      select: { id: true, title: true, locale: true, status: true },
    }),
    db.program.findMany({
      where: { OR: [{ name: contains(q) }, { slug: contains(q) }, { headline: contains(q) }] },
      orderBy: [{ locale: "asc" }, { sortOrder: "asc" }],
      take,
      select: { id: true, name: true, locale: true, published: true },
    }),
    db.tutor.findMany({ where: { OR: [{ name: contains(q) }, { slug: contains(q) }] }, take, select: { id: true, name: true, published: true } }),
    db.counsellor.findMany({ where: { OR: [{ name: contains(q) }, { slug: contains(q) }] }, take, select: { id: true, name: true, onDesk: true } }),
    db.ad.findMany({
      where: { OR: [{ advertiser: contains(q) }, { slug: contains(q) }, { country: contains(q) }, { majors: { has: q } }] },
      take,
      select: { id: true, advertiser: true, slug: true, active: true, country: true },
    }),
  ]);
  return [
    { label: "Articles", hits: articles.map((row) => ({ id: row.id, title: row.title, detail: `${row.locale.toUpperCase()} · ${row.status}`, href: `/admin/articles/${row.id}` })) },
    { label: "Programs", hits: programs.map((row) => ({ id: row.id, title: row.name, detail: `${row.locale.toUpperCase()} · ${row.published ? "live" : "hidden"}`, href: `/admin/programs/${row.id}` })) },
    { label: "Tutors", hits: tutors.map((row) => ({ id: row.id, title: row.name, detail: row.published ? "Live" : "Hidden", href: `/admin/tutors/${row.id}` })) },
    { label: "Counsellors", hits: counsellors.map((row) => ({ id: row.id, title: row.name, detail: row.onDesk ? "On desk" : "Away", href: `/admin/counsellors/${row.id}` })) },
    { label: "Ads", hits: ads.map((row) => ({ id: row.id, title: row.advertiser, detail: [row.slug, row.country, row.active ? "active" : "paused"].filter(Boolean).join(" · "), href: `/admin/ads/${row.id}` })) },
  ].filter((group) => group.hits.length);
}
