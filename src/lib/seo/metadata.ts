import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/content";
import { branches, openingHours } from "@/content/branches";
import type { Metadata } from "next";

export function pageMetadata(_locale: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function rootMetadata(locale: Locale, title: string, description: string): Metadata {
  const settings = getSettings();
  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: title,
      template: `%s · ${settings.companyName}`,
    },
    description,
    applicationName: settings.companyName,
    robots: settings.indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export function organizationJsonLd(locale: Locale) {
  const settings = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    name: settings.companyName,
    url: settings.siteUrl,
    address: branches.map((branch) => ({
      "@type": "PostalAddress",
      name: branch.name,
      streetAddress: branch.street,
      addressLocality: branch.locality,
      addressRegion: settings.region,
      postalCode: branch.postalCode,
      addressCountry: settings.countryCode,
    })),
    openingHoursSpecification: openingHours.map((slot) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: slot.schemaDays, opens: slot.opens, closes: slot.closes })),
    areaServed: "Medan",
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    inLanguage: locale,
  };
}

export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]) {
  const settings = getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${settings.siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
