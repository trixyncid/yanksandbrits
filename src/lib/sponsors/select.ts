/** Pure helpers shared by the server loader and the browser slot. */

export type SponsorAd = {
  id: string;
  advertiser: string;
  start: string;
  end: string;
  weight: number;
  href: string;
  image: string | null;
  logo: string | null;
  title: string;
  body: string;
  cta: string;
  kind: "university" | "brand";
  country: string | null;
  city: string | null;
  majors: string[];
};

// Campaign dates are agreed in Medan time (WIB, UTC+7).
const startOf = (day: string) => new Date(`${day}T00:00:00+07:00`).getTime();

export function isLive(ad: Pick<SponsorAd, "start" | "end">, now: number) {
  return now >= startOf(ad.start) && now < startOf(ad.end) + 24 * 60 * 60 * 1000;
}
