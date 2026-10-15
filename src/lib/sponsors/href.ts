import type { SponsorSlotId } from "./slots";

/** Adds UTM tags so sponsors can see these visits in their own analytics. Existing tags are kept. */
export function trackedHref(href: string, campaign: string, slot: SponsorSlotId, siteHost: string | null) {
  const url = new URL(href);
  const tags = { utm_source: siteHost ?? "website", utm_medium: "sponsored", utm_campaign: campaign, utm_content: slot };
  for (const [key, value] of Object.entries(tags)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}
