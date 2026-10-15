import "server-only";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

/**
 * Countries from `i18n-iso-countries`: the ISO 3166-1 list, bundled with the app so the CMS never
 * depends on an outside service. Built on the server; the editor only receives the finished list.
 */
countries.registerLocale(en);

export type CountryOption = { code: string; name: string };

// ISO's official names are sometimes formal ("Islamic Republic of Iran") or inverted
// ("Moldova, Republic of"). These are the names people use, and what the site shows.
const commonNames: Record<string, string> = {
  CN: "China",
  FK: "Falkland Islands",
  FM: "Micronesia",
  GM: "The Gambia",
  IR: "Iran",
  LA: "Laos",
  MD: "Moldova",
  MK: "North Macedonia",
  PS: "Palestine",
  RU: "Russia",
  SY: "Syria",
  TW: "Taiwan",
  TZ: "Tanzania",
  US: "United States",
  VA: "Vatican City",
  VG: "British Virgin Islands",
  VI: "U.S. Virgin Islands",
};

let cached: CountryOption[] | null = null;

/** Every ISO 3166-1 country, by common English name, A to Z. */
export function listCountries(): CountryOption[] {
  cached ??= Object.keys(countries.getAlpha2Codes())
    .map((code) => ({ code, name: commonNames[code] ?? countries.getName(code, "en", { select: "official" }) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return cached;
}

/** The ISO code for a stored country name, matching common, official, and alias names. */
export function countryCode(name: string): string | null {
  const wanted = name.trim().toLowerCase();
  if (!wanted) return null;
  const listed = listCountries().find((country) => country.name.toLowerCase() === wanted);
  return listed?.code ?? countries.getAlpha2Code(name.trim(), "en") ?? null;
}
