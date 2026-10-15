import { ProgramDetailView } from "@/components/sections/program-detail-view";
import { routing } from "@/i18n/routing";
import { getBundle, getSettings } from "@/lib/content";
import { getProgramFaqs } from "@/lib/faqs";
import { resolveLocale } from "@/lib/locale";
import { getProgram, getProgramFresh, getPrograms } from "@/lib/programs";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => (await getPrograms(locale)).map((program) => ({ locale, slug: program.slug }))),
  );
  return perLocale.flat();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const program = await getProgram(locale, slug);
  if (!program) return {};
  return pageMetadata(locale, `/programs/${program.slug}`, program.seoTitle, program.seoDescription);
}

type Params = Promise<{ locale: string; slug: string }>;

// Programs added in the CMS after a build are not in generateStaticParams, so the slug is
// read inside a boundary and those pages stream in behind a skeleton.
export default function ProgramPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ProgramSkeleton />}>
      <ProgramContent params={params} />
    </Suspense>
  );
}

async function ProgramContent({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const programs = await getPrograms(locale);
  const program = programs.find((item) => item.slug === slug) ?? (await getProgramFresh(locale, slug));
  if (!program) notFound();

  return (
    <ProgramDetailView
      locale={locale}
      copy={getBundle(locale)}
      program={program}
      others={programs.filter((item) => item.slug !== program.slug)}
      faqs={await getProgramFaqs(program.slug)}
      companyName={getSettings().companyName}
    />
  );
}

function ProgramSkeleton() {
  return (
    <div className="bg-white px-4 pt-14 pb-24 md:px-6" aria-busy="true">
      <div className="mx-auto grid w-full max-w-6xl animate-pulse gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="h-4 w-48 rounded bg-logo-soft" />
          <div className="h-8 w-40 rounded-full bg-accent-soft" />
          <div className="h-28 rounded-2xl bg-logo-soft" />
          <div className="h-16 w-4/5 rounded-xl bg-logo-soft" />
        </div>
        <div className="h-[22rem] rounded-[1.75rem] bg-logo-soft sm:h-[27rem]" />
      </div>
    </div>
  );
}
