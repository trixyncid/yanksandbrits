import { TutorsView } from "@/components/sections/tutors-view";
import { getBundle } from "@/lib/content";
import { getTutors } from "@/lib/people";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.tutors;
  return pageMetadata(locale, "/tutors", seo.title, seo.description);
}

export default async function TutorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const tutors = await getTutors(locale);
  return <TutorsView locale={locale} copy={copy} tutors={tutors} />;
}
