import { WhatsappIcon } from "@/components/layout/social-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { StudyAbroadUniversities, UniversitiesLink } from "@/components/sections/study-abroad-universities";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { SponsorAd } from "@/lib/sponsors/select";
import { getSettings, messageFor, whatsappHref } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import {
  ArrowDown,
  ArrowRight,
  FileText,
  ListChecks,
  PenLine,
  Plane,
  Send,
  Award,
  Stamp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";

const serviceIcons = [ListChecks, FileText, PenLine, Send, Award, Stamp, Plane] as const;

function RouteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
      <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 7" />
      <path
        d="M28 108 C48 72 64 56 80 52 C104 46 118 68 132 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="motion-safe:animate-[route-dash_14s_linear_infinite]"
        style={{ strokeDasharray: "6 10" }}
      />
      <circle cx="28" cy="108" r="4" fill="currentColor" />
      <circle cx="132" cy="44" r="4" fill="currentColor" />
    </svg>
  );
}

export function StudyAbroadView({ locale, copy, universityAds }: { locale: Locale; copy: Bundle; universityAds: SponsorAd[] }) {
  const settings = getSettings();
  const company = settings.companyName;
  const consult = `${localePath(locale, "/contact")}#form`;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.studyAbroad, path: "/study-abroad" },
  ];
  const labels = {
    process: "The process",
    next: "Ready to compare campuses?",
    nextBody:
      "Tell us the country, subject, and budget. We will map the next steps — without promising admission.",
    exploreProcess: "See the process",
    exploreUniversities: "Browse universities",
    ask: "Ask on WhatsApp",
  };
  const [who, what] = copy.studyAbroad.blocks;
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.nav.studyAbroad }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* 1. Full-bleed atlas hero — cinematic, not a split collage */}
      <section className="relative min-h-[88svh] overflow-hidden bg-header text-white">
        <Image
          src="/images/london.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%] motion-safe:animate-[hero-fade_900ms_ease]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgb(42_45_52/0.92)_0%,rgb(42_45_52/0.72)_42%,rgb(37_60_161/0.45)_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.55) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <RouteMark className="pointer-events-none absolute -right-8 top-16 size-48 text-white/25 md:top-24 md:right-10 md:size-64" />

        <div className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-end px-4 pt-24 pb-14 md:px-6 md:pb-20">
          <Reveal className="mb-auto">
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
          </Reveal>

          <Reveal className="mt-16 max-w-2xl" delay={0.08}>
            <div className="relative h-10 w-40 sm:h-12 sm:w-48">
              <Image
                src="/yb-logo.svg"
                alt={company}
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="192px"
                priority
              />
            </div>
            <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-white/70 uppercase">{copy.studyAbroad.eyebrow}</p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.6rem,1.4rem+3.2vw,4.25rem)] leading-[1.02] font-semibold tracking-tight text-balance">
              {copy.studyAbroad.title}
            </h1>
            <p className="mt-5 max-w-[38ch] text-base leading-7 text-white/80 md:text-lg md:leading-8">{copy.studyAbroad.body}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={consult}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#process"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                {labels.exploreProcess}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Who + what — editorial tickets, not program cards */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <div
          className="pointer-events-none absolute -left-24 top-0 h-full w-72 skew-x-[-12deg] bg-[linear-gradient(180deg,rgb(37_60_161/0.06),transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">{who?.heading}</p>
            <h2 className="mt-3 max-w-[16ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
              {who?.body}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="relative overflow-hidden rounded-[2rem] bg-header px-7 py-8 text-white shadow-[0_24px_50px_rgb(42_45_52/0.18)] md:px-10 md:py-10">
            <RouteMark className="pointer-events-none absolute -right-6 -bottom-8 size-40 text-white/15" />
            <p className="text-sm font-semibold tracking-[0.16em] text-white/55 uppercase">{what?.heading}</p>
            <p className="relative mt-4 max-w-[36ch] text-lg leading-8 text-white/90 md:text-xl md:leading-9">{what?.body}</p>
            <UniversitiesLink
              ads={universityAds}
              label={labels.exploreUniversities}
              className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/80"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </UniversitiesLink>
          </Reveal>
        </div>
      </section>

      {/* 3. Process spine — vertical route, not home journey columns */}
      <section id="process" className="relative overflow-hidden bg-surface px-4 py-16 md:px-6 md:py-24">
        <div
          className="pointer-events-none absolute inset-y-0 left-[11%] hidden w-px bg-[linear-gradient(180deg,transparent,rgb(37_60_161/0.35)_12%,rgb(37_60_161/0.35)_88%,transparent)] md:block lg:left-1/2"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto mb-12 w-full max-w-6xl md:mb-16">
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">{labels.process}</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
              {copy.services.title}
            </h2>
            <p className="max-w-[36ch] text-base leading-7 text-muted md:text-right">{copy.services.body}</p>
          </div>
        </Reveal>

        <Stagger as="ol" className="relative mx-auto flex w-full max-w-6xl flex-col gap-6" stagger={0.07}>
          {copy.services.items.map((item, index) => {
            const Icon = serviceIcons[index % serviceIcons.length] as ComponentType<{ className?: string }>;
            const onRight = index % 2 === 1;
            return (
              <StaggerItem
                key={item.heading}
                as="li"
                className="relative flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8"
              >
                <div
                  className={`order-2 max-w-md ${
                    onRight ? "md:order-3 md:col-start-3 md:justify-self-start" : "md:order-1 md:col-start-1 md:justify-self-end"
                  }`}
                >
                  <div className={`flex items-start gap-3 ${onRight ? "" : "md:flex-row-reverse md:text-right"}`}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand shadow-[0_8px_20px_rgb(42_45_52/0.06)] transition-transform hover:scale-105">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-ink">{item.heading}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 order-1 mx-auto grid size-12 place-items-center rounded-full bg-brand font-mono text-sm font-semibold text-white shadow-[0_10px_24px_rgb(37_60_161/0.35)] md:order-2 md:col-start-2">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* 4. University directory — CMS university campaigns; hidden while none is live */}
      <StudyAbroadUniversities
        intro={copy.universitiesIntro}
        ads={universityAds}
        sponsoredLabel={copy.ads.sponsored}
        majorsLabel={"Majors"}
      />

      {/* 5. CTA */}
      <section className="relative overflow-hidden bg-header px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute -left-16 top-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.5),transparent_68%)]" aria-hidden="true" />
        <RouteMark className="pointer-events-none absolute right-6 bottom-4 size-28 text-white/15 md:size-40" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[16ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
              {labels.next}
            </h2>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-white/75">{labels.nextBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={consult}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {copy.nav.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <WhatsappButton
              href={wa}
              fallbackHref={consult}
              label={labels.ask}
              page="study-abroad"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <WhatsappIcon className="size-4" />
              {labels.ask}
            </WhatsappButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
