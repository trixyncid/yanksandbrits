/**
 * Sponsored placements sold directly to partners. See docs/sponsorship.md for specs and rules.
 * A slot with no live campaign renders nothing, so pages never show gaps.
 *
 * Ads run in two places only: the Home hero banner and the Study abroad university directory.
 * Campaigns saved before this may still list retired slot ids; the site ignores them and the
 * CMS drops them when the campaign is next opened.
 *
 * `limit` is how many campaigns may be live in a slot on the same day.
 * `null` means every live campaign is shown.
 */
export const sponsorSlots = {
  "home-hero": { format: "hero", limit: 3, label: "Home · hero banner", note: "Extra slides in the Home carousel, after the first one" },
  universities: { format: "university", limit: null, label: "Study abroad · universities", note: "Listed in the Study abroad directory, filtered by country" },
} as const;

export type SponsorSlotId = keyof typeof sponsorSlots;
export type SponsorFormat = (typeof sponsorSlots)[SponsorSlotId]["format"];
export const slotIds = Object.keys(sponsorSlots) as [SponsorSlotId, ...SponsorSlotId[]];

export const isSlotId = (slot: string): slot is SponsorSlotId => slot in sponsorSlots;

export const formatSpecs: Record<SponsorFormat, { art: "image"; image: string; logo?: string }> = {
  hero: { art: "image", image: "16:9, at least 1920×1080" },
  university: { art: "image", image: "16:10 or 3:2, at least 1200 wide", logo: "optional, transparent PNG" },
};
