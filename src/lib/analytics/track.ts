export type AnalyticsEvent =
  | { name: "cta_click"; location: string; label: string }
  | { name: "whatsapp_click"; page: string; program: string }
  | { name: "lead_form_start" }
  | { name: "lead_form_submit"; status: "success" | "failure" }
  | { name: "program_view"; slug: string }
  | { name: "tutor_view"; slug: string }
  | { name: "expo_register_click"; slug: string }
  | { name: "article_read_50"; slug: string }
  | { name: "article_read_90"; slug: string }
  | { name: "faq_expand"; id: string }
  | { name: "language_switch"; locale: string }
  | { name: "scroll_depth"; depth: 25 | 50 | 75 | 90 }
  | { name: "ad_impression"; slot: string; campaign: string }
  | { name: "ad_click"; slot: string; campaign: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const consentKey = "consent-v1";

export function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(consentKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { analytics?: boolean; decided?: boolean };
    if (!parsed.decided) return null;
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean) {
  window.localStorage.setItem(consentKey, JSON.stringify({ analytics, decided: true }));
  window.dispatchEvent(new Event("consent-change"));
}

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  if (!readConsent()?.analytics) return;
  const { name, ...params } = event;
  window.gtag?.("event", name, params);
}
