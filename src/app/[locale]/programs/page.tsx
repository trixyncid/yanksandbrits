import { ProgramsView } from "@/components/sections/programs-view";
import { getBundle } from "@/lib/content";
import { getPrograms } from "@/lib/programs";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.programs;
  return pageMetadata(locale, "/programs", seo.title, seo.description);
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const programs = await getPrograms(locale);
  return <ProgramsView locale={locale} copy={copy} programs={programs} />;
}
