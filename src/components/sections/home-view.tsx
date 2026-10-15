import { SectionTitle } from "@/components/layout/section";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { localePath } from "@/lib/utils";
import { Hero } from "@/components/sections/hero";
import { ArticlesShowcase } from "@/components/sections/articles-showcase";
import { JourneyShowcase } from "@/components/sections/journey-showcase";
import { ProgramsShowcase } from "@/components/sections/programs-showcase";
import type { ArticleSummary } from "@/lib/articles";
import { expoDateLabel } from "@/lib/expos/format";
import type { Expo } from "@/lib/expos/schema";
import type { HomeContent } from "@/lib/home/schema";
import type { Program } from "@/lib/programs/types";
import type { Testimonial } from "@/lib/testimonials/schema";
import type { SponsorAd } from "@/lib/sponsors/select";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { ArrowRight, Award, BookOpen, Building2, CalendarDays, Globe, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Study abroad is hidden from the home page for now. Set to true to bring back its card under the
// banner and the universities section.
const showStudyAbroad = false;

const highlightIcons = [BookOpen, Building2, Award, GraduationCap];
const figureColumns = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

/**
 * The home page. Every word, photo, and figure comes from the CMS: the Homepage editor (`home`),
 * Programs, Testimonials, Articles, and Ads. `copy` only supplies interface labels such as
 * "Next slide". A section with nothing in the CMS is left out rather than filled with samples.
 */
export function HomeView({
  locale,
  copy,
  home,
  programs,
  testimonials,
  articles,
  nextExpo,
  heroAds,
}: {
  locale: Locale;
  copy: Bundle;
  home: HomeContent;
  programs: Program[];
  testimonials: Testimonial[];
  articles: ArticleSummary[];
  /** The soonest dated expo from the CMS, shown on the Expo card. */
  nextExpo: Expo | null;
  heroAds: SponsorAd[];
}) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const { hero, features, why, figures, previews } = home;
  const highlights = why.highlights.map((label, index) => ({ label, icon: highlightIcons[index % highlightIcons.length] }));

  return (
    <>
      {/* The hero's own top padding clears the floating header. */}
      <div className="relative" data-own-nav-space>
        <Hero
          ads={heroAds}
          sponsoredLabel={copy.ads.sponsored}
          previousLabel={copy.hero.previous}
          nextLabel={copy.hero.next}
          pauseLabel={copy.hero.pause}
          playLabel={copy.hero.play}
          slideLabel={copy.hero.slide}
          // The site keeps one slide; the carousel's other spots are sold as hero banners.
          slides={[
            {
              title: hero.title,
              highlight: hero.highlight || undefined,
              body: hero.body,
              cta: hero.cta,
              href: consult,
              image: hero.image,
              alt: hero.imageAlt,
              position: "62% center",
            },
          ]}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2 px-4 md:px-6">
          <div
            className={`mx-auto grid w-full max-w-6xl ${showStudyAbroad ? "grid-cols-3" : "grid-cols-2"} overflow-hidden rounded-[1.75rem] bg-white shadow-[0_22px_50px_rgb(42_45_52/0.14)] motion-safe:animate-[soft-pop_600ms_ease]`}
          >
            {[
              { ...features.programs, href: localePath(locale, "/programs"), icon: BookOpen, show: true, highlight: false },
              { ...features.studyAbroad, href: localePath(locale, "/study-abroad"), icon: Globe, show: showStudyAbroad, highlight: true },
              { ...features.counsellors, href: localePath(locale, "/counselling"), icon: GraduationCap, show: true, highlight: false },
            ]
              .filter((card) => card.show)
              .map((card, index) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`group flex flex-col px-3 py-5 transition-colors motion-safe:animate-[rise-in_650ms_ease_both] sm:px-5 sm:py-7 md:px-8 md:py-8 ${card.highlight ? "bg-logo-soft" : "hover:bg-logo-soft/50 bg-white"}`}
                    style={{ animationDelay: `${120 + index * 90}ms` }}
                  >
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                      <span className="bg-accent-soft text-brand grid size-11 shrink-0 place-items-center rounded-full sm:size-14">
                        <Icon className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-ink text-sm font-semibold tracking-tight sm:text-base md:text-lg">{card.title}</h2>
                        <p className="text-muted mt-1 line-clamp-2 text-xs leading-5 sm:text-sm sm:leading-6">{card.body}</p>
                      </div>
                    </div>
                    <Link href={card.href} className="text-brand hover:text-brand-deep mx-auto mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors sm:mt-6 sm:text-sm">
                      {features.more}
                      <ArrowRight className="size-3.5 sm:size-4" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
          </div>
        </div>
      </div>

      {/* 1. Offer — what they can enroll in */}
      {programs.length ? <ProgramsShowcase locale={locale} intro={home.programs} programs={programs} className="pt-28 md:pt-40" /> : <div className="h-28 md:h-40" />}

      {/* 2. Differentiator + proof — why trust this school */}
      <section className="relative overflow-x-clip bg-white px-4 py-16 md:px-6 md:py-24">
        <div className="text-logo/50 pointer-events-none absolute top-10 right-8 size-24" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="size-full">
            {[
              [18, 14, 12, -28],
              [42, 10, 10, 36],
              [28, 30, 14, -12],
              [54, 28, 11, 48],
              [16, 48, 10, 22],
              [40, 52, 13, -34],
            ].map(([x, y, width, rotate]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={width} height="3" rx="1.5" fill="currentColor" transform={`rotate(${rotate} ${x} ${y})`} />
            ))}
          </svg>
        </div>
        <div className="pointer-events-none absolute right-0 bottom-40 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.08),transparent_68%)]" aria-hidden="true" />

        <div
          className={`relative mx-auto grid w-full max-w-6xl items-center gap-12 motion-safe:animate-[rise-in_700ms_ease_both] lg:gap-16 ${why.imageMain ? "lg:grid-cols-[1.05fr_1fr]" : ""}`}
          style={{ animationDelay: "180ms" }}
        >
          {why.imageMain ? (
            <div className="relative mx-auto h-[28rem] w-full max-w-md sm:h-[32rem]">
              <div className="bg-accent-soft pointer-events-none absolute top-10 -left-8 size-56 rounded-[46%_54%_60%_40%] sm:size-64" aria-hidden="true" />
              <div className="text-brand/35 pointer-events-none absolute bottom-8 -left-2 grid grid-cols-5 gap-2.5" aria-hidden="true">
                {Array.from({ length: 35 }, (_, index) => (
                  <span key={index} className="size-1.5 rounded-full bg-current" />
                ))}
              </div>

              <div className="absolute inset-x-[8%] top-6 bottom-16 overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_rgb(37_60_161/0.14)] motion-safe:animate-[hero-fade_500ms_ease]">
                <Image src={why.imageMain} alt="" fill className="object-cover" sizes="(min-width: 1024px) 420px, 80vw" />
              </div>

              {why.badgeValue && why.badgeLabel ? (
                <div className="bg-brand absolute top-2 left-0 z-10 flex max-w-[11rem] items-center gap-2.5 rounded-2xl px-3.5 py-3 text-white shadow-[0_14px_30px_rgb(37_60_161/0.28)] motion-safe:animate-[rise-in_700ms_ease]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                    <Award className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-snug font-semibold">
                    <span className="block text-base leading-none">{why.badgeValue}</span>
                    <span className="mt-1 block text-[11px] font-medium text-white/80">{why.badgeLabel}</span>
                  </p>
                </div>
              ) : null}

              {why.imageInset ? (
                <div className="absolute right-0 bottom-0 z-10 h-36 w-[58%] overflow-hidden rounded-[1.35rem] border-[6px] border-white shadow-[0_18px_40px_rgb(37_60_161/0.16)] motion-safe:animate-[rise-in_650ms_ease] sm:h-40">
                  <Image src={why.imageInset} alt="" fill className="object-cover" sizes="240px" />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="bg-accent-soft text-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {why.eyebrow}
            </p>
            <SectionTitle className="mt-5 max-w-[16ch]">{why.title}</SectionTitle>
            <p className="text-muted mt-5 max-w-[40ch] text-base leading-7 md:text-lg md:leading-8">{why.body}</p>

            {highlights.length ? (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {highlights.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="bg-accent-soft text-brand grid size-12 shrink-0 place-items-center rounded-full">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-ink text-base font-semibold tracking-tight">{label}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <Link href={consult} className="bg-brand hover:bg-brand-deep mt-9 inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-colors">
              {why.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Key figures: only what an editor has entered and checked. Hidden when there are none. */}
        {figures.items.length ? (
          <dl
            className={`bg-brand relative mx-auto mt-14 grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] text-white motion-safe:animate-[rise-in_700ms_ease_both] md:mt-20 ${figureColumns[figures.items.length]}`}
            style={{ animationDelay: "280ms" }}
          >
            {figures.items.map((item, index) => (
              <div key={item.label} className={`px-6 py-8 text-center sm:px-8 sm:py-10 ${index > 0 ? "border-t border-white/15 sm:border-t-0 sm:border-l" : ""}`}>
                <dd className="text-4xl font-semibold tracking-tight md:text-5xl">
                  <CountUp value={item.value} />
                </dd>
                <dt className="mt-2 text-sm leading-6 text-white/75">{item.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
        {figures.items.length && figures.note ? <p className="text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-6">{figures.note}</p> : null}
      </section>

      {/* 4. Process — reduce uncertainty, CTA mid-funnel */}
      <JourneyShowcase locale={locale} journey={home.journey} href={consult} />

      {/* 5. Social proof — peers who already started */}
      {testimonials.length ? <TestimonialsShowcase intro={{ ...home.testimonials, previous: copy.testimonialsIntro.previous, next: copy.testimonialsIntro.next }} items={testimonials} /> : null}

      {/* 6. Next actions — people & events */}
      <section className="bg-surface relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute top-6 right-8 size-20 bg-[radial-gradient(circle,var(--logo)_1.2px,transparent_1.5px)] bg-[size:10px_10px]" aria-hidden="true" />
        <Reveal className="mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-2">
          {(["tutors", "expo"] as const).map((key) => {
            const block = previews[key];
            const path = key === "tutors" ? "/tutors" : "/expo";
            return (
              <article key={key} className="interactive-lift group overflow-hidden rounded-[1.6rem] bg-white shadow-[0_16px_40px_rgb(42_45_52/0.06)]">
                {block.image ? (
                  <div className="relative h-44 overflow-hidden">
                    <Image src={block.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 50vw, 100vw" />
                  </div>
                ) : null}
                <div className="p-5">
                  <h2 className="text-xl font-semibold tracking-tight">{block.title}</h2>
                  <p className="text-muted mt-2 text-sm leading-6">{block.body}</p>
                  {key === "expo" && nextExpo ? (
                    <Link href={localePath(locale, `/expo#${nextExpo.slug}`)} className="bg-accent-soft hover:bg-accent-soft/70 mt-4 flex items-start gap-3 rounded-2xl p-3.5 transition-colors">
                      <span className="bg-brand grid size-10 shrink-0 place-items-center rounded-xl text-white">
                        <CalendarDays className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-brand block text-xs font-semibold tracking-[0.14em] uppercase">Next expo</span>
                        <span className="text-ink block font-semibold">{nextExpo.name}</span>
                        <span className="text-muted block text-sm">
                          <time dateTime={nextExpo.startsAt!}>{expoDateLabel(nextExpo)}</time>
                          {nextExpo.venue || nextExpo.city ? ` · ${[nextExpo.venue, nextExpo.city].filter(Boolean).join(", ")}` : ""}
                        </span>
                      </span>
                    </Link>
                  ) : null}
                  <Link href={localePath(locale, path)} className="text-brand hover:text-brand-deep mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors">
                    {block.link}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </Reveal>
      </section>

      {/* 7. Nurture — lowest-intent content last */}
      {articles.length ? <ArticlesShowcase locale={locale} intro={home.articles} articles={articles} /> : null}
    </>
  );
}
