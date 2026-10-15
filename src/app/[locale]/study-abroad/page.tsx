import { StudyAbroadView } from "@/components/sections/study-abroad-view";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { getSponsors } from "@/lib/sponsors";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.studyAbroad;
  return pageMetadata(locale, "/study-abroad", seo.title, seo.description);
}

export default async function StudyAbroadPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const universityAds = await getSponsors(locale, "universities");
  return <StudyAbroadView locale={locale} copy={copy} universityAds={universityAds} />;
}
