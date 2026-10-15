import { defineRouting } from "next-intl/routing";

// The site is English only. The `[locale]` segment stays internal: URLs carry no language prefix,
// and nothing reads the visitor's browser language or sets a language cookie.
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "never",
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
