import { Shell } from "@/components/layout/shell";
import { JsonLd } from "@/components/seo/json-ld";
import { routing, type Locale } from "@/i18n/routing";
import { getBundle } from "@/lib/content";
import { getPrograms } from "@/lib/programs";
import { resolveLocale } from "@/lib/locale";
import { organizationJsonLd, rootMetadata } from "@/lib/seo/metadata";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import "@/styles/article.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  return rootMetadata(locale, copy.seo.home.title, copy.seo.home.description);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const programs = await getPrograms(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={organizationJsonLd(locale)} />
        <Shell locale={locale as Locale} copy={copy} programs={programs}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
