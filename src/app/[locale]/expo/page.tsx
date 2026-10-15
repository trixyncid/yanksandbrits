import { ExpoView } from "@/components/sections/expo-view";
import { getBundle } from "@/lib/content";
import { getExpos } from "@/lib/expos";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.expo;
  return pageMetadata(locale, "/expo", seo.title, seo.description);
}

export default async function ExpoPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const expos = await getExpos();
  return <ExpoView locale={locale} copy={copy} expos={expos} />;
}
