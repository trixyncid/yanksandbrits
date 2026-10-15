// Where a visit came from, kept for the session so a lead is credited to the page that brought the visitor in,
// not the page they happened to submit on. Browser only.

const firstKey = "attr-first";
const lastKey = "attr-last";
const entryKey = "attr-entry";

type Touch = { utmSource: string; utmMedium: string; utmCampaign: string; utmTerm: string; utmContent: string };
type Entry = { referrer: string; landingPage: string };

function read<T>(key: string): Partial<T> {
  try {
    return JSON.parse(window.sessionStorage.getItem(key) ?? "{}") as Partial<T>;
  } catch {
    return {};
  }
}

function write(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage blocked: the lead still goes through, with less attribution.
  }
}

/** Run on every page view. Records UTM tags (first and latest) and the session's entry page and referrer. */
export function captureTouch() {
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmTerm: params.get("utm_term") ?? "",
    utmContent: params.get("utm_content") ?? "",
  };
  if (Object.values(touch).some(Boolean)) {
    if (!read<Touch>(firstKey).utmSource && !read<Touch>(firstKey).utmMedium) write(firstKey, touch);
    write(lastKey, touch);
  }
  if (!read<Entry>(entryKey).landingPage) {
    // Same-site referrers are internal navigation, not a source.
    const external = document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : "";
    write(entryKey, { referrer: external.slice(0, 300), landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 300) });
  }
}

/** The attribution sent with a lead. */
export function readAttribution() {
  captureTouch();
  const first = read<Touch>(firstKey);
  const last = read<Touch>(lastKey);
  const entry = read<Entry>(entryKey);
  return {
    utmSource: last.utmSource ?? "",
    utmMedium: last.utmMedium ?? "",
    utmCampaign: last.utmCampaign ?? "",
    utmTerm: last.utmTerm ?? "",
    utmContent: last.utmContent ?? "",
    firstUtmSource: first.utmSource ?? "",
    firstUtmMedium: first.utmMedium ?? "",
    firstUtmCampaign: first.utmCampaign ?? "",
    referrer: entry.referrer ?? "",
    landingPage: entry.landingPage ?? window.location.pathname,
    device: window.matchMedia("(max-width: 767px)").matches ? ("mobile" as const) : ("desktop" as const),
  };
}
