import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Flag, ScoreJourney } from "@/components/sections/story-parts";
import { StoryGrid } from "@/components/sections/story-grid";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { Story } from "@/lib/stories/schema";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, GraduationCap, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** One student's story: the quote, the journey in numbers, then the story itself. */
export function StoryDetailView({ locale, copy, story, others }: { locale: Locale; copy: Bundle; story: Story; others: Story[] }) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: copy.footer.success, path: "/success-stories" },
    { name: story.studentName, path: `/success-stories/${story.slug}` },
  ];
  const facts = [
    story.program ? { icon: BookOpen, label: "Program", value: story.program.name, href: localePath(locale, `/programs/${story.program.slug}`) } : null,
    story.destination ? { icon: GraduationCap, label: "Destination", value: story.destination, flag: story.countryCode, sub: story.country } : null,
    story.intake ? { icon: CalendarDays, label: "Intake", value: story.intake } : null,
  ].filter((fact) => fact !== null);
  const more = others.slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <section className="relative overflow-hidden bg-header text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 size-[26rem] rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.5),transparent_65%)]" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-10 pb-14 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:pt-14 md:pb-20 lg:gap-16">
          <Reveal>
            <Link href={localePath(locale, "/success-stories")} className="inline-flex items-center gap-1.5 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {copy.footer.success}
            </Link>
            <p className="mt-8 font-display text-6xl leading-none text-white/25" aria-hidden="true">
              “
            </p>
            <h1 className="mt-1 font-display text-[clamp(1.9rem,1.1rem+2vw,3.1rem)] leading-[1.15] font-normal text-balance">{story.headline}</h1>
            <p className="mt-6 text-lg">
              <span className="font-semibold">{story.studentName}</span>
              {story.program ? <span className="text-white/65"> · {story.program.name}</span> : null}
            </p>
          </Reveal>
          <Reveal delay={0.12} className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-white/10 ring-1 ring-white/15">
              {story.photo ? (
                <Image src={story.photo} alt={story.photoAlt} fill priority className="object-cover" sizes="(min-width: 768px) 24rem, 100vw" />
              ) : (
                <span className="grid size-full place-items-center text-white/30" aria-hidden="true">
                  <UserRound className="size-20" />
                </span>
              )}
            </div>
            {story.countryCode ? (
              <span className="absolute -bottom-4 left-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-lg">
                <Flag code={story.countryCode} className="text-base" />
                {story.country}
              </span>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* The journey in numbers, overlapping the masthead. */}
      {facts.length || story.scoreBefore ? (
        <section className="relative bg-white px-4 md:px-6">
          {/* One row on wide screens however many facts there are; the score takes a double column. */}
          <Reveal className="relative z-10 mx-auto -mt-8 grid w-full max-w-6xl gap-px overflow-hidden rounded-[1.75rem] bg-line shadow-[0_22px_50px_rgb(42_45_52/0.1)] sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
            {story.scoreBefore ? (
              <div className="bg-white p-5 sm:col-span-2 md:p-6 lg:col-span-2">
                <ScoreJourney label={story.scoreLabel} before={story.scoreBefore} after={story.scoreAfter} gain={story.scoreGain} />
              </div>
            ) : null}
            {facts.map((fact) => {
              const Icon = fact.icon;
              const value = (
                <span className="mt-1 flex items-center gap-2 font-semibold text-ink">
                  {"flag" in fact ? <Flag code={fact.flag ?? null} /> : null}
                  {fact.value}
                </span>
              );
              return (
                <div key={fact.label} className="flex gap-4 bg-white p-5 md:p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-logo uppercase">{fact.label}</p>
                    {"href" in fact && fact.href ? (
                      <Link href={fact.href} className="hover:text-brand">
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                    {"sub" in fact && fact.sub ? <p className="text-sm text-muted">{fact.sub}</p> : null}
                  </div>
                </div>
              );
            })}
          </Reveal>
        </section>
      ) : null}

      <article className="bg-white px-4 pt-14 pb-16 md:px-6 md:pt-20 md:pb-24">
        <div className="article-prose mx-auto w-full max-w-3xl">
          {story.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <p className="mx-auto mt-10 flex w-full max-w-3xl items-center gap-2 border-t border-line pt-6 text-sm text-muted">
          <ShieldCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />
          Shared with {story.studentName}&apos;s written consent.
        </p>
      </article>

      {more.length ? (
        <section className="bg-surface px-4 py-16 md:px-6 md:py-20" aria-labelledby="more-heading">
          <div className="mx-auto w-full max-w-6xl">
            <h2 id="more-heading" className="text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.1] font-semibold tracking-tight">
              More stories
            </h2>
            <StoryGrid stories={more} hrefFor={Object.fromEntries(more.map((item) => [item.slug, localePath(locale, `/success-stories/${item.slug}`)]))} />
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-header px-4 py-16 text-white md:px-6 md:py-20">
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{copy.successPage.nextTitle}</h2>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-white/75">{copy.successPage.nextBody}</p>
          </div>
          <Link href={consult} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-brand transition-transform hover:-translate-y-0.5">
            {copy.nav.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
