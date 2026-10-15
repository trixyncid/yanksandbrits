// Marketing channel for a lead, from its UTM tags and entry referrer. Loosely follows GA4's default channel
// grouping, so the numbers in the CMS and the export line up with what the marketing team sees in GA.

export const channels = ["Paid search", "Paid social", "Organic search", "Organic social", "Email", "Display", "Referral", "Other campaign", "Direct"] as const;
export type Channel = (typeof channels)[number];

const socialSources = /facebook|instagram|^ig$|^fb$|meta|tiktok|twitter|^x$|linkedin|youtube|whatsapp|telegram|line|pinterest|snapchat|threads/;
const searchSources = /google|bing|yahoo|duckduckgo|ecosia|baidu|yandex|naver/;
const socialHosts = /(^|\.)(facebook|fb|instagram|tiktok|twitter|x|t|linkedin|lnkd|youtube|youtu|whatsapp|wa|telegram|line|pinterest|threads)\.(com|me|co|net|be|in)$/;
const searchHosts = /(^|\.)(google|bing|yahoo|duckduckgo|ecosia|baidu|yandex|naver)\.[a-z.]+$/;

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function channelFor({ utmSource = "", utmMedium = "", referrer = "" }: { utmSource?: string; utmMedium?: string; referrer?: string }): Channel {
  const source = utmSource.trim().toLowerCase();
  const medium = utmMedium.trim().toLowerCase();

  if (source || medium) {
    const paid = /^(cpc|ppc|paid|paidsearch|paid[-_ ]?search|paid[-_ ]?social|paidsocial|cpm|cpv|ads?)$/.test(medium) || medium.startsWith("paid");
    if (paid) return socialSources.test(source) || medium.includes("social") ? "Paid social" : "Paid search";
    if (/^(e-?mail|newsletter)$/.test(medium)) return "Email";
    if (/^(display|banner|interstitial)$/.test(medium)) return "Display";
    if (/social|^sm$|^organic[-_ ]?social$/.test(medium) || (!medium && socialSources.test(source))) return "Organic social";
    if (medium === "organic" || (!medium && searchSources.test(source))) return "Organic search";
    if (medium === "referral") return "Referral";
    return "Other campaign";
  }

  const from = host(referrer);
  if (!from) return "Direct";
  if (searchHosts.test(from)) return "Organic search";
  if (socialHosts.test(from)) return "Organic social";
  return "Referral";
}
