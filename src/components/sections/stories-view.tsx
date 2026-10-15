import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Flag, ScoreJourney } from "@/components/sections/story-parts";
import { StoryGrid } from "@/components/sections/story-grid";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { Story } from "@/lib/stories/schema";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, BadgeCheck, BookHeart, FileSignature, GraduationCap, MapPin, Quote, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const promiseIcons = [FileSignature, BadgeCheck, GraduationCap];

/** The Student stories page. Every story comes from the CMS and was published with recorded consent. */
export function StoriesView({ locale, copy, stories }: { locale: Locale; copy: Bundle; stories: Story[] }) {
  const page = copy.successPage;
  const consult = `${localePath(locale, "/contact")}#form`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: copy.footer.success, path: "/success-stories" },
  ];
  const href = (slug: string) => localePath(locale, `/success-stories/${slug}`);
  const featured = stories.find((story) => story.featured) ?? null;
  const rest = featured ? stories.filter((story) => story !== featured) : stories;
  const countries = new Set(stories.map((story) => story.country).filter(Boolean)).size;
  const programs = new Set(stories.map((story) => story.program?.slug).filter(Boolean)).size;
  const empty = stories.length === 0;
  const stats = [
    { value: stories.length, label: stories.length === 1 ? "story" : "stories" },
    ...(countries ? [{ value: countries, label: countries === 1 ? "country" : "countries" }] : []),
    ...(programs ? [{ value: programs, label: programs === 1 ? "program" : "programs" }] : []),
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* Masthead: dark, like the Expo page. With stories, the totals sit beside the title; without, the promises do. */}
      <section className="relative overflow-hidden bg-header text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.55),transparent_65%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 left-6 font-display text-[11rem] leading-none text-white/[0.06] select-none md:text-[16rem]" aria-hidden="true">
          “
        </div>
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pt-10 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-6 md:pt-14 md:pb-20 lg:gap-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="text-sm text-white/65">
              <ol className="flex flex-wrap gap-2">
                {crumbs.map((crumb, index) => (
                  <li key={crumb.path} className="flex gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {index === crumbs.length - 1 ? (
                      <span aria-current="page" className="text-white">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link href={localePath(locale, crumb.path)} className="underline-offset-4 hover:underline">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
              <BookHeart className="size-4" aria-hidden="true" />
              {page.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[15ch] text-[clamp(2.6rem,1.3rem+3vw,4.25rem)] leading-[1.02] font-semibold tracking-tight text-balance">{empty ? page.emptyTitle : page.title}</h1>
            <p className="mt-5 max-w-[44ch] text-base leading-7 text-white/80 md:text-lg md:leading-8">{empty ? page.emptyBody : page.body}</p>
          </Reveal>

          <Reveal delay={0.12}>
            {empty ? (
              <ul className="grid gap-3">
                {page.promises.map((promise, index) => {
                  const Icon = promiseIcons[index % promiseIcons.length];
                  return (
                    <li key={promise.title} className="flex gap-4 rounded-[1.4rem] bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur-sm">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-semibold">{promise.title}</span>
                        <span className="mt-0.5 block text-sm leading-6 text-white/70">{promise.body}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <dl className="grid overflow-hidden rounded-[1.5rem] bg-white/[0.07] ring-1 ring-white/10 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`px-4 py-6 text-center ${index > 0 ? "border-l border-white/10" : ""}`}>
                    <dd className="text-4xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
                    <dt className="mt-1 text-sm text-white/65">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>
        </div>
      </section>

      {featured ? (
        <section className="relative bg-white px-4 pt-16 md:px-6 md:pt-24" aria-labelledby="featured-heading">
          <Reveal className="mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden rounded-[2rem] bg-surface p-4 md:grid-cols-[0.85fr_1.15fr] md:gap-12 md:p-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-accent-soft">
              {featured.photo ? (
                <Image src={featured.photo} alt={featured.photoAlt} fill priority className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
              ) : (
                <span className="grid size-full place-items-center text-brand/40" aria-hidden="true">
                  <UserRound className="size-20" />
                </span>
              )}
              {featured.countryCode ? (
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold shadow-sm">
                  <Flag code={featured.countryCode} className="text-base" />
                  {featured.country}
                </span>
              ) : null}
            </div>
            <div className="pb-2 md:py-6 md:pr-6">
              <p id="featured-heading" className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
                Featured story
              </p>
              <Quote className="mt-5 size-8 text-brand/25" aria-hidden="true" />
              <blockquote className="mt-2 font-display text-[clamp(1.6rem,1rem+1.4vw,2.35rem)] leading-[1.2] text-ink">{featured.headline}</blockquote>
              <p className="mt-5 text-base">
                <span className="font-semibold">{featured.studentName}</span>
                {featured.program ? <span className="text-muted"> · {featured.program.name}</span> : null}
              </p>
              <div className="mt-7 grid gap-5 rounded-[1.4rem] bg-white p-5 sm:grid-cols-2">
                <ScoreJourney label={featured.scoreLabel} before={featured.scoreBefore} after={featured.scoreAfter} gain={featured.scoreGain} />
                {featured.destination ? (
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-logo uppercase">Now heading to</p>
                    <p className="mt-2 flex items-start gap-2 text-base font-semibold">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                      {featured.destination}
                    </p>
                    {featured.intake ? <p className="mt-1 pl-6 text-sm text-muted">{featured.intake}</p> : null}
                  </div>
                ) : null}
              </div>
              <Link href={href(featured.slug)} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-brand-deep">
                Read {featured.studentName}&apos;s story
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </section>
      ) : null}

      {rest.length ? (
        <section className="bg-white px-4 py-16 md:px-6 md:py-24" aria-labelledby="all-stories-heading">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal>
              <h2 id="all-stories-heading" className="text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
                {featured ? "More stories" : "Their stories"}
              </h2>
            </Reveal>
            <StoryGrid stories={rest} hrefFor={Object.fromEntries(rest.map((story) => [story.slug, href(story.slug)]))} />
          </div>
        </section>
      ) : null}

      {empty ? (
        // Placeholders that read as "on their way", not as missing content.
        <section className="bg-white px-4 py-16 md:px-6 md:py-24" aria-label="Stories to come">
          <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-[1.6rem] border-2 border-dashed border-line p-5" style={{ opacity: 1 - index * 0.25 }}>
                <div className="aspect-[4/3] rounded-[1.1rem] bg-surface" />
                <div className="mt-5 h-3 w-3/4 rounded-full bg-logo-soft" />
                <div className="mt-2.5 h-3 w-1/2 rounded-full bg-logo-soft" />
                <div className="mt-6 h-2.5 w-1/3 rounded-full bg-accent-soft" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-surface px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(146_148_153/0.2)_1px,transparent_1.2px)] bg-[size:18px_18px] opacity-50" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{page.nextTitle}</h2>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted">{page.nextBody}</p>
          </div>
          <Link href={consult} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-brand-deep">
            {copy.nav.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
