import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Expo } from "./schema";

export const exposTag = "expos";

/**
 * The lineup: published expos that have not finished. Dated ones come first, soonest first, then
 * formats still waiting for a date, in the CMS order. Cached for minutes rather than hours so a
 * finished expo drops off soon after it ends; CMS saves refresh it at once through the `expos` tag.
 */
export async function getExpos(): Promise<Expo[]> {
  "use cache";
  cacheTag(exposTag);
  cacheLife("minutes");

  if (!process.env.DATABASE_URL) return [];
  try {
    const now = new Date();
    const rows = await db.expo.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    const open = rows.filter((row) => !row.startsAt || (row.endsAt ?? endOfDay(row.startsAt)) >= now);
    const dated = open.filter((row) => row.startsAt).sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime());
    const pending = open.filter((row) => !row.startsAt);
    return [...dated, ...pending].map((row) => ({
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      audience: row.audience,
      covers: row.covers,
      image: row.image,
      imageAlt: row.imageAlt ?? "",
      startsAt: row.startsAt?.toISOString() ?? null,
      endsAt: row.endsAt?.toISOString() ?? null,
      venue: row.venue,
      city: row.city,
      registerUrl: row.registerUrl,
    }));
  } catch (error) {
    console.error("[expos] Not shown:", error instanceof Error ? error.message : error);
    return [];
  }
}

// A one-day event stays listed until the end of its day in Medan (WIB, UTC+7).
function endOfDay(start: Date) {
  const wib = new Date(start.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() + 1) - 7 * 60 * 60 * 1000);
}

/** The soonest dated expo, for the home page. */
export async function getNextExpo(): Promise<Expo | null> {
  return (await getExpos()).find((expo) => expo.startsAt) ?? null;
}
