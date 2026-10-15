import { CounsellingView } from "@/components/sections/counselling-view";
import { getBundle } from "@/lib/content";
import { getCounsellors } from "@/lib/people";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.counselling;
  return pageMetadata(locale, "/counselling", seo.title, seo.description);
}

export default async function CounsellingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const counsellors = await getCounsellors(locale);
  return <CounsellingView locale={locale} copy={copy} counsellors={counsellors} />;
}
