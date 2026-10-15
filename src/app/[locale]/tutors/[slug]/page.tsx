import { TutorDetailView } from "@/components/sections/tutor-detail-view";
import { routing } from "@/i18n/routing";
import { getBundle, getSettings } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { getTutorFresh, getTutors } from "@/lib/people";
import { getPrograms } from "@/lib/programs";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => (await getTutors(locale)).map((tutor) => ({ locale, slug: tutor.slug }))),
  );
  const params = perLocale.flat();
  // The route needs at least one param to prerender; an unknown slug renders the not-found page.
  return params.length ? params : routing.locales.map((locale) => ({ locale, slug: "profile" }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const tutor = await getTutorFresh(locale, slug);
  if (!tutor) return {};
  const description = (tutor.bio || `${tutor.name}, ${tutor.role}`).slice(0, 155);
  return pageMetadata(locale, `/tutors/${tutor.slug}`, tutor.name.slice(0, 34), description);
}

// Tutors added after a build are not in generateStaticParams, so the slug is read inside a boundary.
export default function TutorPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] animate-pulse bg-white" aria-busy="true" />}>
      <TutorContent params={params} />
    </Suspense>
  );
}

async function TutorContent({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const [tutor, tutors, programs] = await Promise.all([getTutorFresh(locale, slug), getTutors(locale), getPrograms(locale)]);
  if (!tutor) notFound();
  return (
    <TutorDetailView
      locale={locale}
      copy={getBundle(locale)}
      tutor={tutor}
      others={tutors.filter((item) => item.slug !== tutor.slug)}
      programs={programs.map(({ slug: programSlug, name }) => ({ slug: programSlug, name }))}
      companyName={getSettings().companyName}
    />
  );
}
