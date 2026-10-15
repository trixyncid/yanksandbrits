import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/content";
import { db } from "@/lib/db";
import { trackedHref } from "./href";
import { sponsorCopySchema } from "./schema";
import type { SponsorAd } from "./select";
import type { SponsorSlotId } from "./slots";
import { z } from "zod";

export const adsTag = "ads";

const copySchema = z.object({ en: sponsorCopySchema });

export const toDay = (date: Date) => date.toISOString().slice(0, 10);

// Active campaigns that have not ended. Exact start and end are checked in the browser (Medan time),
// so pages stay cached and a campaign still switches on and off on its dates.
async function getActiveCampaigns() {
  "use cache";
  cacheTag(adsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await db.ad.findMany({
      where: { active: true, endsOn: { gte: new Date(toDay(yesterday)) } },
      orderBy: [{ startsOn: "asc" }, { slug: "asc" }],
    });
    return rows.flatMap((row) => {
      const copy = copySchema.safeParse(row.copy);
      if (!copy.success) return [];
      return [{ ...row, copy: copy.data, startsOn: toDay(row.startsOn), endsOn: toDay(row.endsOn) }];
    });
  } catch (error) {
    console.error("[ads] Sponsored placements are off:", error instanceof Error ? error.message : error);
    return [];
  }
}

/** Campaigns booked for a slot, in the visitor's language. */
export async function getSponsors(locale: Locale, slot: SponsorSlotId): Promise<SponsorAd[]> {
  const campaigns = await getActiveCampaigns();
  const settings = getSettings();
  const host = settings.domainConfigured ? new URL(settings.siteUrl).hostname : null;
  return campaigns
    .filter((campaign) => campaign.slots.includes(slot))
    .map((campaign) => ({
      id: campaign.slug,
      advertiser: campaign.advertiser,
      start: campaign.startsOn,
      end: campaign.endsOn,
      weight: campaign.weight,
      href: trackedHref(campaign.href, campaign.slug, slot, host),
      image: campaign.image,
      logo: campaign.logo,
      kind: campaign.kind,
      country: campaign.country,
      city: campaign.city,
      majors: campaign.majors,
      ...campaign.copy[locale],
    }));
}
