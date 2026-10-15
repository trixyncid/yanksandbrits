import { WhatsappIcon } from "@/components/layout/social-icons";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { DashField } from "@/components/ui/dash-field";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import type { TutorProfile } from "@/lib/people/types";
import type { ProgramLink } from "@/lib/programs/types";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Award, BookOpen, Briefcase, GraduationCap, Languages, Sparkles, Star, Trophy, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function TutorDetailView({
  locale,
  copy,
  tutor,
  others,
  programs,
  companyName,
}: {
  locale: Locale;
  copy: Bundle;
  tutor: TutorProfile;
  others: TutorProfile[];
  programs: ProgramLink[];
  companyName: string;
}) {
  const labels = {
    home: "Home",
    featured: "Featured tutor",
    languages: "Teaches in",
    programs: "Teaches on",
    subjects: "Subjects",
    about: "About",
    education: "Education",
    certifications: "Certifications",
    experience: "Teaching experience",
    results: "Notable results",
    resultsNote: "Past student results do not guarantee the same outcome.",
    ask: `Ask about ${tutor.name}`,
    others: "Other tutors",
    all: "All tutors",
    ready: "Want a tutor who fits your goal?",
    readyBody: "Tell us your target. A counsellor matches the tutor and timetable in the free consultation.",
  };
  const consult = `${localePath(locale, "/contact")}#form`;
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: tutor.name }));
  const crumbs = [
    { name: labels.home, path: "/" },
    { name: copy.nav.tutors, path: "/tutors" },
    { name: tutor.name, path: `/tutors/${tutor.slug}` },
  ];
  const taught = programs.filter((program) => tutor.programs.includes(program.slug));
  const credentials = [
    { icon: GraduationCap, title: labels.education, items: tutor.education },
    { icon: Award, title: labels.certifications, items: tutor.certifications },
  ].filter((group) => group.items.length);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: tutor.name,
          jobTitle: tutor.role || undefined,
          description: tutor.bio || undefined,
          knowsLanguage: tutor.languages.length ? tutor.languages : undefined,
          worksFor: { "@type": "EducationalOrganization", name: companyName },
        }}
      />

      {/* Portrait hero */}
      <section className="relative overflow-hidden bg-white px-4 pt-10 pb-16 md:px-6 md:pt-14 md:pb-24">
        <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.1),transparent_68%)]" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-sm lg:order-2 lg:max-w-md">
            <div className="pointer-events-none absolute -top-5 -right-5 size-48 rounded-[46%_54%_60%_40%] bg-accent-soft" aria-hidden="true" />
            <DashField className="pointer-events-none absolute -bottom-6 -left-8 size-20 text-logo/45" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#eceeef_0%,#e9ecf5_55%,#dfe3ee_100%)] shadow-[0_24px_50px_rgb(42_45_52/0.14)]">
              {tutor.photo ? (
                <Image src={tutor.photo} alt={tutor.name} fill priority className="object-cover" sizes="(min-width: 1024px) 420px, 80vw" />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-logo">
                  <UserRound className="size-20" aria-hidden="true" />
                </span>
              )}
            </div>
            {tutor.languages.length ? (
              <div className="absolute bottom-6 -left-4 z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_rgb(42_45_52/0.16)] sm:-left-8">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-brand">
                  <Languages className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-medium text-muted">{labels.languages}</span>
                  <span className="block max-w-[12rem] truncate text-sm font-semibold text-ink">{tutor.languages.join(", ")}</span>
                </span>
              </div>
            ) : null}
          </Reveal>

          <Reveal className="min-w-0 lg:order-1">
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
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
              {tutor.featured ? <Star className="size-3.5 fill-current" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
              {tutor.featured ? labels.featured : copy.tutorsPage.eyebrow}
            </p>
            <h1 className="mt-5 text-[clamp(2.4rem,1.2rem+2.6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance">{tutor.name}</h1>
            {tutor.role ? <p className="mt-3 text-lg font-medium text-brand md:text-xl">{tutor.role}</p> : null}
            {tutor.bio ? <p className="mt-5 max-w-[48ch] text-base leading-7 text-muted md:text-lg md:leading-8">{tutor.bio}</p> : null}
            {tutor.subjects.length ? (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={labels.subjects}>
                {tutor.subjects.map((subject) => (
                  <li key={subject} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink">
                    {subject}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={consult} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-brand-deep">
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <WhatsappButton
                href={wa}
                fallbackHref={consult}
                label={labels.ask}
                page="tutors"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft"
              >
                <WhatsappIcon className="size-4 text-brand" />
                {labels.ask}
              </WhatsappButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Credentials, experience, and programs */}
      <section className="relative overflow-hidden bg-surface px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.2),transparent_68%)]" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid content-start gap-6">
            {credentials.length ? (
              <Stagger className="grid gap-6 sm:grid-cols-2">
                {credentials.map(({ icon: Icon, title, items }) => (
                  <StaggerItem key={title} className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                    <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-brand">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
                    <ul className="mt-3 space-y-2.5">
                      {items.map((item) => (
                        <li key={item} className="text-sm leading-6 text-ink">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}
            {tutor.experience ? (
              <Reveal className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Briefcase className="size-5 text-brand" aria-hidden="true" />
                  {labels.experience}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">{tutor.experience}</p>
              </Reveal>
            ) : null}
          </div>

          <div className="grid content-start gap-6">
            {tutor.results ? (
              <Reveal className="relative overflow-hidden rounded-[1.75rem] bg-brand p-7 text-white shadow-[0_24px_50px_rgb(37_60_161/0.22)]">
                <DashField className="pointer-events-none absolute right-5 bottom-5 size-16 text-white/15" />
                <Trophy className="size-7 text-white/80" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold tracking-tight">{labels.results}</h2>
                <p className="mt-3 text-base leading-7 text-white/85">{tutor.results}</p>
                <p className="mt-4 text-xs leading-5 text-white/60">{labels.resultsNote}</p>
              </Reveal>
            ) : null}
            {taught.length ? (
              <Reveal className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <BookOpen className="size-5 text-brand" aria-hidden="true" />
                  {labels.programs}
                </h2>
                <ul className="mt-4 grid gap-2">
                  {taught.map((program) => (
                    <li key={program.slug}>
                      <Link
                        href={localePath(locale, `/programs/${program.slug}`)}
                        className="group flex items-center justify-between rounded-xl border border-line px-4 py-3 font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
                      >
                        {program.name}
                        <ArrowUpRight className="size-4 text-brand" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
          <Reveal className="relative mx-auto mb-10 flex w-full max-w-6xl items-end justify-between gap-4">
            <h2 className="text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{labels.others}</h2>
            <Link href={localePath(locale, "/tutors")} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep">
              {labels.all}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-3">
            {others.slice(0, 3).map((other) => (
              <StaggerItem key={other.slug} as="li">
                <Link href={localePath(locale, `/tutors/${other.slug}`)} className="interactive-lift group flex items-center gap-4 rounded-[1.5rem] border border-line bg-white p-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-logo-soft">
                    {other.photo ? <Image src={other.photo} alt="" fill className="object-cover" sizes="64px" /> : <UserRound className="absolute inset-0 m-auto size-7 text-logo" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink group-hover:text-brand">{other.name}</span>
                    <span className="block truncate text-sm text-muted">{other.role}</span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-header px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute -right-10 bottom-0 size-64 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.45),transparent_68%)]" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{labels.ready}</h2>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-white/75">{labels.readyBody}</p>
          </div>
          <Link href={consult} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5">
            {copy.nav.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
