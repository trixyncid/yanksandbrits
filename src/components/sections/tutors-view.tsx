import { WhatsappIcon } from "@/components/layout/social-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { TutorProfile } from "@/lib/people/types";
import { messageFor, whatsappHref } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, GraduationCap, Briefcase, Languages, Star, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const silhouetteSlots = [
  { rotate: "-rotate-2", delay: "0ms" },
  { rotate: "rotate-1", delay: "80ms" },
  { rotate: "-rotate-1", delay: "160ms" },
  { rotate: "rotate-2", delay: "240ms" },
  { rotate: "rotate-0", delay: "320ms" },
  { rotate: "-rotate-2", delay: "400ms" },
] as const;

export function TutorsView({ locale, copy, tutors }: { locale: Locale; copy: Bundle; tutors: TutorProfile[] }) {
  const tutorCount = tutors.length;
  const consult = `${localePath(locale, "/contact")}#form`;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.tutors, path: "/tutors" },
  ];
  const labels = {
    gallery: "Tutor gallery",
    waiting: "Tutor profiles coming soon",
    abroad: "Educated abroad",
    industry: "Industry experience",
    next: "Find a tutor who fits your target",
    nextBody:
      "Tell us the score or campus you are aiming for, and we will match you with the right tutor.",
    ask: "Ask on WhatsApp",
    programs: "See programs",
    profile: "View profile",
    featured: "Featured",
    team: "Our tutors",
  };
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.nav.tutors }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* Faculty wall hero — diagonal crop, portrait energy */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block" aria-hidden="true">
          <div className="absolute inset-0 origin-top-right skew-x-[-8deg] overflow-hidden bg-header">
            <Image src="/images/class.jpg" alt="" fill className="scale-110 object-cover opacity-90" sizes="46vw" priority />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,transparent_28%)]" />
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pt-10 pb-16 md:px-6 md:pt-14 md:pb-24 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="min-w-0">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <ol className="flex flex-wrap gap-2">
                {crumbs.map((crumb, index) => (
                  <li key={crumb.path} className="flex gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {index === crumbs.length - 1 ? (
                      <span aria-current="page">{crumb.name}</span>
                    ) : (
                      <Link href={localePath(locale, crumb.path)} className="underline-offset-4 hover:underline">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-brand uppercase">{copy.tutorsPage.eyebrow}</p>
            <h1 className="mt-4 max-w-[15ch] text-[clamp(2.4rem,1.2rem+2.6vw,3.85rem)] leading-[1.05] font-semibold tracking-tight text-balance">
              {copy.tutorsPage.title}
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-7 text-muted md:text-lg md:leading-8">{copy.tutorsPage.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={consult}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={localePath(locale, "/programs")}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft"
              >
                {labels.programs}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative h-64 overflow-hidden rounded-[1.75rem] lg:hidden">
            <Image src="/images/class.jpg" alt="" fill className="object-cover" sizes="100vw" priority />
          </Reveal>
        </div>
      </section>

      {/* Traits strip */}
      <section className="border-y border-line bg-surface px-4 py-10 md:px-6">
        <Stagger className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-2">
          <StaggerItem className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-brand shadow-[0_8px_20px_rgb(42_45_52/0.06)] transition-transform hover:scale-105">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{labels.abroad}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{copy.previews.tutors.body}</p>
            </div>
          </StaggerItem>
          <StaggerItem className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-brand shadow-[0_8px_20px_rgb(42_45_52/0.06)] transition-transform hover:scale-105">
              <Briefcase className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{labels.industry}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {"Workplace experience shaped into score practice and campus prep."}
              </p>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Portrait gallery empty state */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <Reveal className="relative mx-auto mb-10 w-full max-w-6xl md:mb-14">
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">{labels.gallery}</p>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
            {tutorCount === 0 ? labels.waiting : labels.team}
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-7 text-muted">{tutorCount === 0 ? copy.previews.tutors.empty : copy.previews.tutors.body}</p>
        </Reveal>

        {tutorCount > 0 ? (
          <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {tutors.map((tutor) => (
              <StaggerItem key={tutor.slug} as="li">
                <Link
                  href={localePath(locale, `/tutors/${tutor.slug}`)}
                  className="interactive-lift group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgb(42_45_52/0.08)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(160deg,#eceeef_0%,#e9ecf5_55%,#dfe3ee_100%)]">
                    {tutor.photo ? (
                      <Image src={tutor.photo} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-logo">
                        <UserRound className="size-14" aria-hidden="true" />
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#2a2d3499_100%)]" />
                    {tutor.featured ? (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand backdrop-blur-sm">
                        <Star className="size-3 fill-current" aria-hidden="true" />
                        {labels.featured}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="text-xl font-semibold tracking-tight text-ink">{tutor.name}</h3>
                    {tutor.role ? <p className="mt-1 text-sm font-medium text-brand">{tutor.role}</p> : null}
                    {tutor.bio ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{tutor.bio}</p> : null}
                    {tutor.subjects.length ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {tutor.subjects.slice(0, 4).map((subject) => (
                          <li key={subject} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-brand">
                            {subject}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                      {tutor.languages.length ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                          <Languages className="size-4 shrink-0 text-brand" aria-hidden="true" />
                          <span className="truncate">{tutor.languages.join(", ")}</span>
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand">
                        {labels.profile}
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
            {silhouetteSlots.map((slot, index) => (
              <StaggerItem key={index} as="li" className={slot.rotate}>
                <div className="interactive-lift aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(160deg,#eceeef_0%,#e9ecf5_55%,#dfe3ee_100%)] p-5">
                  <div className="flex h-full flex-col justify-between">
                    <span className="grid size-14 place-items-center rounded-full bg-white/70 text-logo transition-transform group-hover:scale-105">
                      <UserRound className="size-7" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="h-3 w-2/3 rounded-full bg-white/80" />
                      <div className="mt-2 h-2.5 w-1/2 rounded-full bg-white/55" />
                      <p className="mt-4 font-mono text-[0.65rem] tracking-[0.18em] text-logo uppercase">
                        {"Coming soon"}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="relative overflow-hidden bg-brand px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute -left-10 bottom-0 font-display text-[11rem] leading-none text-white/10 select-none" aria-hidden="true">
          T
        </div>
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
              {labels.next}
            </h2>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-white/80">{labels.nextBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={consult}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-brand transition-transform hover:-translate-y-0.5"
            >
              {copy.nav.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <WhatsappButton
              href={wa}
              fallbackHref={consult}
              label={labels.ask}
              page="tutors"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
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
