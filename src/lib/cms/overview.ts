import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/lib/db";
import { slotIds } from "@/lib/sponsors/slots";
import { todayWib } from "./ads";

// Campaigns that only list retired placements show nowhere, so they are not counted.
const showing = { slots: { hasSome: slotIds } };

export const ranges = [7, 30, 90] as const;
export type RangeDays = (typeof ranges)[number];

const DAY = 24 * 60 * 60 * 1000;

function percent(part: number, whole: number) {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

/** Splits [start, end) into `count` equal buckets and counts timestamps in each. */
function bucket(times: Date[], end: number, span: number, count: number) {
  const size = span / count;
  const start = end - span;
  const buckets = Array.from({ length: count }, () => 0);
  for (const time of times) {
    const offset = time.getTime() - start;
    if (offset < 0 || offset >= span) continue;
    buckets[Math.min(count - 1, Math.floor(offset / size))]++;
  }
  return buckets;
}

const dayMs = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();

/** Campaign days booked in each month, counting both ends of a campaign as booked. */
function campaignDaysByMonth(ads: { startsOn: Date; endsOn: Date; kind: "university" | "brand" }[], months: { start: number; end: number }[]) {
  return months.map(({ start, end }) => {
    const totals = { university: 0, brand: 0 };
    for (const ad of ads) {
      const from = Math.max(ad.startsOn.getTime(), start);
      const to = Math.min(ad.endsOn.getTime() + DAY, end);
      if (to > from) totals[ad.kind] += Math.round((to - from) / DAY);
    }
    return totals;
  });
}

export async function getOverview(range: RangeDays) {
  await connection();
  const now = new Date();
  const nowMs = now.getTime();
  const since = new Date(nowMs - range * DAY);
  const previous = new Date(nowMs - 2 * range * DAY);
  const today = todayWib(now);

  // Seven months centred on this one, in Medan time.
  const [year, month] = today.split("-").map(Number);
  const months = Array.from({ length: 7 }, (_, index) => {
    const start = Date.UTC(year, month - 1 + index - 3, 1);
    const end = Date.UTC(year, month + index - 3, 1);
    return { start, end, label: new Date(start).toLocaleString("en-GB", { month: "short", timeZone: "UTC" }), current: index === 3 };
  });

  const [
    articles,
    newArticles,
    previousArticles,
    programs,
    tutors,
    counsellors,
    ads,
    activity,
    upcomingArticles,
  ] = await Promise.all([
    db.article.findMany({ select: { status: true, publishedAt: true, locale: true, excerpt: true, seoDescription: true, coverImage: true } }),
    db.article.count({ where: { createdAt: { gte: since } } }),
    db.article.count({ where: { createdAt: { gte: previous, lt: since } } }),
    db.program.findMany({ select: { published: true, syllabus: true, locale: true } }),
    db.tutor.findMany({ select: { published: true, featured: true } }),
    db.counsellor.findMany({ select: { published: true, onDesk: true } }),
    db.ad.findMany({
      where: { active: true, ...showing, endsOn: { gte: new Date(months[0].start) }, startsOn: { lt: new Date(months[6].end) } },
      select: { id: true, slug: true, advertiser: true, kind: true, startsOn: true, endsOn: true, country: true },
    }),
    Promise.all([
      db.article.findMany({ where: { updatedAt: { gte: previous } }, select: { updatedAt: true } }),
      db.program.findMany({ where: { updatedAt: { gte: previous } }, select: { updatedAt: true } }),
      db.tutor.findMany({ where: { updatedAt: { gte: previous } }, select: { updatedAt: true } }),
      db.counsellor.findMany({ where: { updatedAt: { gte: previous } }, select: { updatedAt: true } }),
      db.ad.findMany({ where: { updatedAt: { gte: previous } }, select: { updatedAt: true } }),
    ]),
    db.article.findMany({
      where: { status: "published", publishedAt: { gt: now, lte: new Date(nowMs + 14 * DAY) } },
      orderBy: { publishedAt: "asc" },
      take: 5,
      select: { id: true, title: true, publishedAt: true, locale: true },
    }),
  ]);

  const published = articles.filter((article) => article.status === "published" && article.publishedAt && article.publishedAt <= now).length;
  const scheduled = articles.filter((article) => article.status === "published" && article.publishedAt && article.publishedAt > now).length;
  const drafts = articles.filter((article) => article.status === "draft").length;
  const seoReady = articles.filter((article) => (article.seoDescription || article.excerpt) && article.coverImage).length;

  const edits = activity.flat().map((row) => row.updatedAt);
  const columns = range === 7 ? 7 : 15;
  const current = bucket(edits, nowMs, range * DAY, columns);
  const editsNow = edits.filter((time) => time >= since).length;
  const editsBefore = edits.length - editsNow;

  const liveAds = ads.filter((ad) => ad.startsOn.toISOString().slice(0, 10) <= today && ad.endsOn.toISOString().slice(0, 10) >= today);
  const byMonth = campaignDaysByMonth(ads, months);
  const inSevenDays = new Date(dayMs(today) + 7 * DAY).toISOString().slice(0, 10);

  const english = programs.filter((program) => program.locale === "en");
  const catalog = english.length ? english : programs;
  const livePrograms = catalog.filter((program) => program.published);
  const moduleCounts = livePrograms.map((program) => (Array.isArray(program.syllabus) ? program.syllabus.length : 0));

  return {
    now,
    articles: {
      total: articles.length,
      published,
      drafts,
      scheduled,
      newInRange: newArticles,
      change: previousArticles === 0 ? null : Math.round(((newArticles - previousArticles) / previousArticles) * 100),
      bahasa: percent(articles.filter((article) => article.locale === "id").length, articles.length),
      english: percent(articles.filter((article) => article.locale === "en").length, articles.length),
      seoReady: percent(seoReady, articles.length),
      /** Articles with a cover image and a summary for search and social cards. */
      ready: seoReady,
    },
    programs: {
      // Each language is a separate record, so count one language (English when there is any).
      live: catalog.filter((program) => program.published).length,
      total: catalog.length,
      averageModules: moduleCounts.length ? Math.round(moduleCounts.reduce((sum, count) => sum + count, 0) / moduleCounts.length) : 0,
      usingFallback: programs.length === 0,
    },
    people: {
      tutors: tutors.filter((tutor) => tutor.published).length,
      featuredTutors: tutors.filter((tutor) => tutor.published && tutor.featured).length,
      counsellors: counsellors.filter((counsellor) => counsellor.published).length,
      onDesk: counsellors.filter((counsellor) => counsellor.published && counsellor.onDesk).length,
    },
    activity: {
      columns: current,
      total: editsNow,
      change: editsBefore === 0 ? null : Math.round(((editsNow - editsBefore) / editsBefore) * 100),
      bucketDays: range / columns,
    },
    ads: {
      live: liveAds.length,
      liveUniversities: liveAds.filter((ad) => ad.kind === "university").length,
      daysThisMonth: byMonth[3].university + byMonth[3].brand,
      months: months.map((item, index) => ({ label: item.label, current: item.current, ...byMonth[index] })),
    },
    upcoming: [
      ...upcomingArticles.map((article) => ({
        kind: "article" as const,
        id: article.id,
        title: article.title,
        detail: `Goes live · ${article.locale.toUpperCase()}`,
        at: article.publishedAt!.toISOString(),
        href: `/admin/articles/${article.id}`,
      })),
      ...ads
        .filter((ad) => {
          const start = ad.startsOn.toISOString().slice(0, 10);
          return start > today && start <= inSevenDays;
        })
        .map((ad) => ({ kind: "ad-start" as const, id: ad.id, title: ad.advertiser, detail: "Campaign starts", at: ad.startsOn.toISOString(), href: `/admin/ads/${ad.id}` })),
      ...ads
        .filter((ad) => {
          const end = ad.endsOn.toISOString().slice(0, 10);
          return end >= today && end <= inSevenDays;
        })
        .map((ad) => ({ kind: "ad-end" as const, id: ad.id, title: ad.advertiser, detail: "Campaign ends", at: ad.endsOn.toISOString(), href: `/admin/ads/${ad.id}` })),
    ].sort((a, b) => a.at.localeCompare(b.at)),
  };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;

/** Small counts for the sidebar and the notification bell. Shared by both within one request. */
export const getShellCounts = cache(async () => {
  await connection();
  const now = new Date();
  const today = todayWib(now);
  const week = new Date(now.getTime() + 7 * DAY);
  const [drafts, liveAds, unassignedLeads, scheduledSoon, adsChanging] = await Promise.all([
    db.article.count({ where: { status: "draft" } }),
    db.ad.count({ where: { active: true, ...showing, startsOn: { lte: new Date(`${today}T00:00:00Z`) }, endsOn: { gte: new Date(`${today}T00:00:00Z`) } } }),
    // Leads waiting for a counsellor: the number someone has to act on.
    db.lead.count({ where: { counsellorId: null } }),
    db.article.findMany({
      where: { status: "published", publishedAt: { gt: now, lte: week } },
      orderBy: { publishedAt: "asc" },
      take: 5,
      select: { id: true, title: true, publishedAt: true },
    }),
    db.ad.findMany({
      where: {
        active: true,
        ...showing,
        OR: [
          { startsOn: { gt: new Date(`${today}T00:00:00Z`), lte: week } },
          { endsOn: { gte: new Date(`${today}T00:00:00Z`), lte: week } },
        ],
      },
      take: 5,
      select: { id: true, advertiser: true, startsOn: true, endsOn: true },
    }),
  ]);
  const notifications = [
    ...scheduledSoon.map((article) => ({
      id: `article-${article.id}`,
      title: article.title,
      detail: "Article goes live",
      at: article.publishedAt!.toISOString(),
      href: `/admin/articles/${article.id}`,
    })),
    ...adsChanging.map((ad) => {
      const starting = ad.startsOn.toISOString().slice(0, 10) > today;
      return {
        id: `ad-${ad.id}`,
        title: ad.advertiser,
        detail: starting ? "Campaign starts" : "Campaign ends",
        at: (starting ? ad.startsOn : ad.endsOn).toISOString(),
        href: `/admin/ads/${ad.id}`,
      };
    }),
  ].sort((a, b) => a.at.localeCompare(b.at));
  return { drafts, liveAds, unassignedLeads, notifications };
});

export type ShellCounts = Awaited<ReturnType<typeof getShellCounts>>;
