import "server-only";
import { countryCode, listCountries } from "@/lib/countries";
import { db } from "@/lib/db";

/**
 * Options for the ad editor: every ISO country, plus a short "suggested" group listed first:
 * countries campaigns already use, then the site's destination countries.
 */
// Where Medan students most often apply; listed first in the country picker.
const commonDestinations = ["United Kingdom", "United States", "Canada", "Australia", "Singapore", "Malaysia"];

export async function adFormOptions() {
  const used = await db.ad.findMany({ where: { country: { not: null } }, distinct: ["country"], select: { country: true } });
  const names = [...used.flatMap((row) => (row.country ? [row.country] : [])), ...commonDestinations];
  const suggested = [...new Set(names.map(countryCode).filter((code): code is string => code !== null))];
  return { countries: listCountries(), suggested };
}
