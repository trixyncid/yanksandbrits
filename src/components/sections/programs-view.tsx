import { JsonLd } from "@/components/seo/json-ld";
import { WhatsappButton } from "@/components/layout/trackers";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { DashField } from "@/components/ui/dash-field";
import type { Bundle } from "@/content/types";
import type { Program } from "@/lib/programs/types";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, GraduationCap, Layers3, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const cardTitles: Record<string, string> = {
  "computer-science": "Computer Science / IT",
};

function programTitle(locale: Locale, program: Program) {
  return locale === "en" && cardTitles[program.slug] ? cardTitles[program.slug]! : program.name;
}

export function ProgramsView({ locale, copy, programs }: { locale: Locale; copy: Bundle; programs: Program[] }) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.programs, path: "/programs" },
  ];
  const [featured, ...rest] = programs;
  const labels = {
    paths: "Our programs",
    outcomes: "What you work on",
    forWho: "Who it's for",
    next: "Ready to start?",
    nextBody:
      "Tell us your score target or campus goal. We will help pick a program and book a free consultation.",
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <section className="relative overflow-hidden bg-white px-4 pt-10 pb-16 md:px-6 md:pt-14 md:pb-24">
        <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.1),transparent_68%)]" aria-hidden="true" />
        <DashField className="pointer-events-none absolute top-16 right-8 size-20 text-logo/45" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
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

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {copy.programsIntro.eyebrow}
            </p>
            <h1 className="mt-5 max-w-[16ch] text-[clamp(2.4rem,1.2rem+2.6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance">
              {copy.programsIntro.title}
            </h1>
            <p className="mt-5 max-w-[40ch] text-base leading-7 text-muted md:text-lg md:leading-8">{copy.programsIntro.body}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={consult}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a href="#program-paths" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft">
                {labels.paths}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem] lg:max-w-none">
            <div className="pointer-events-none absolute top-8 -left-6 size-48 rounded-[46%_54%_60%_40%] bg-accent-soft sm:size-56" aria-hidden="true" />
            <div className="absolute inset-x-[10%] top-4 bottom-20 overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_rgb(42_45_52/0.14)]">
              <Image src="/images/study.jpg" alt="" fill className="object-cover" sizes="(min-width: 1024px) 420px, 80vw" priority />
            </div>
            <div className="absolute right-0 bottom-0 h-32 w-[55%] overflow-hidden rounded-[1.35rem] border-[6px] border-white shadow-[0_18px_40px_rgb(42_45_52/0.16)] sm:h-36">
              <Image src="/images/class.jpg" alt="" fill className="object-cover" sizes="240px" />
            </div>
            <div className="absolute top-6 left-0 z-10 rounded-2xl bg-brand px-3.5 py-3 text-white shadow-[0_14px_30px_rgb(37_60_161/0.28)]">
              <p className="text-xs font-medium text-white/75">{copy.programsIntro.eyebrow}</p>
              <p className="mt-0.5 text-sm font-semibold">{programs.length} {programs.length === 1 ? "program" : "programs"}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="program-paths" className="relative overflow-hidden bg-surface px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.2),transparent_68%)]" aria-hidden="true" />
        <DashField className="pointer-events-none absolute top-10 right-10 size-24 text-logo/40" />

        <Reveal className="relative mx-auto mb-12 flex w-full max-w-6xl flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">{labels.paths}</p>
            <h2 className="mt-2 max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
              {copy.programsIntro.title}
            </h2>
          </div>
          <p className="max-w-[34ch] text-base leading-7 text-muted md:text-right">{copy.programsIntro.body}</p>
        </Reveal>

        {featured ? (
          <Reveal>
          <article className="interactive-lift relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_22px_50px_rgb(42_45_52/0.1)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[16rem] sm:min-h-[20rem] lg:min-h-full">
              <Image src={featured.image} alt={featured.imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#2a2d34a6_100%)]" />
              <span className="absolute top-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
                {featured.tag}
              </span>
              <p className="absolute bottom-5 left-5 font-mono text-sm tracking-[0.22em] text-white/85">01</p>
            </div>

            <div className="flex flex-col justify-between gap-8 p-6 md:p-8 lg:p-10">
              <div>
                <h3 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">{programTitle(locale, featured)}</h3>
                <p className="mt-3 text-base leading-7 text-muted">{featured.summary}</p>
                <p className="mt-5 text-sm font-semibold text-brand">{labels.outcomes}</p>
                <ul className="mt-3 space-y-3">
                  {featured.outcomes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-ink md:text-base">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-brand">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-logo-soft px-3 py-1.5 text-xs font-semibold text-ink">
                    <Users className="size-3.5 text-brand" aria-hidden="true" />
                    {labels.forWho}
                  </span>
                  {featured.duration ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-logo-soft px-3 py-1.5 text-xs font-semibold text-ink">
                      <Clock3 className="size-3.5 text-brand" aria-hidden="true" />
                      {featured.duration}
                    </span>
                  ) : null}
                  {featured.formatLabel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-logo-soft px-3 py-1.5 text-xs font-semibold text-ink">
                      <Layers3 className="size-3.5 text-brand" aria-hidden="true" />
                      {featured.formatLabel.split(".")[0]}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">{featured.targetAudience}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={localePath(locale, `/programs/${featured.slug}`)}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
                  >
                    {copy.programsIntro.see}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                  <WhatsappButton
                    href={whatsappHref(messageFor(copy.whatsapp.programText, { program: featured.name, page: featured.name }))}
                    fallbackHref={consult}
                    label={copy.programsIntro.ask}
                    page="programs"
                    program={featured.slug}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:bg-logo-soft"
                  >
                    <WhatsappIcon className="size-4 text-brand" />
                    {copy.programsIntro.ask}
                  </WhatsappButton>
                </div>
              </div>
            </div>
          </article>
          </Reveal>
        ) : null}

        <Stagger as="ul" className="relative mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-3">
          {rest.map((program, index) => {
            const title = programTitle(locale, program);
            const href = whatsappHref(messageFor(copy.whatsapp.programText, { program: program.name, page: program.name }));
            return (
              <StaggerItem key={program.slug} as="li">
                <article className="interactive-lift group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgb(42_45_52/0.08)]">
                  <div className="relative h-48 overflow-hidden sm:h-52">
                    <Image src={program.image} alt={program.imageAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 30vw, 100vw" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,#2a2d34b0_100%)]" />
                    <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
                      {program.tag}
                    </span>
                    <p className="absolute bottom-4 left-4 font-mono text-xs tracking-[0.2em] text-white/80">0{index + 2}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{program.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {program.outcomes.slice(0, 2).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm leading-6 text-ink">
                          <Check className="mt-1 size-3.5 shrink-0 text-brand" aria-hidden="true" />
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                      <Link
                        href={localePath(locale, `/programs/${program.slug}`)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
                      >
                        {copy.programsIntro.see}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                      <WhatsappButton
                        href={href}
                        fallbackHref={consult}
                        label={copy.programsIntro.ask}
                        page="programs"
                        program={program.slug}
                        className="grid size-11 place-items-center rounded-full bg-accent-soft text-brand transition-transform hover:-translate-y-0.5"
                      >
                        <WhatsappIcon className="size-4" />
                      </WhatsappButton>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(146_148_153/0.18)_1px,transparent_1.2px)] bg-[size:18px_18px] opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="rounded-[1.75rem] bg-brand p-7 text-white shadow-[0_24px_50px_rgb(37_60_161/0.22)] md:p-9">
            <GraduationCap className="size-8 text-white/80" aria-hidden="true" />
            <h2 className="mt-5 max-w-[16ch] text-2xl font-semibold tracking-tight md:text-3xl">{copy.counsellor.title}</h2>
            <p className="mt-4 max-w-[34ch] text-sm leading-7 text-white/80 md:text-base">{copy.counsellor.body}</p>
            <Link
              href={localePath(locale, "/counselling")}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
            >
              {copy.nav.counselling}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>

          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2" delay={0.08}>
            {copy.counsellor.steps.slice(0, 4).map((step, index) => (
              <StaggerItem key={step.title} as="li" className="interactive-lift rounded-[1.5rem] bg-white p-5 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                <p className="font-mono text-xs tracking-[0.18em] text-logo">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative overflow-hidden bg-header px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute -right-10 bottom-0 size-64 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.45),transparent_68%)]" aria-hidden="true" />
        <DashField className="pointer-events-none absolute top-8 left-8 size-16 text-white/20" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{labels.next}</h2>
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
            <Link
              href={localePath(locale, "/contact")}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              {copy.nav.contact}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
