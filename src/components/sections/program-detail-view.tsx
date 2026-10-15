import { FaqList } from "@/components/layout/faq-list";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { DashField } from "@/components/ui/dash-field";
import type { Bundle } from "@/content/types";
import type { Faq } from "@/lib/faqs/schema";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import type { Program } from "@/lib/programs/types";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Route, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  locale: Locale;
  copy: Bundle;
  program: Program;
  others: Program[];
  faqs: Faq[];
  companyName: string;
};

const formatNames = {
  en: { online: "Online", offline: "In person in Medan", hybrid: "Online or in person" },
} as const;

function labelsFor(locale: Locale, program: Program) {
  return {
    home: "Home",
    duration: "Duration",
    forWho: "Who it's for",
    unsure: "Not sure it fits?",
    unsureBody: "Share your target and timeline. A counsellor will suggest the right program and starting level.",
    outcomes: "What you will work on",
    outcomesBody: "Each session has a clear purpose, and progress is checked against your own target.",
    path: "Learning path",
    pathTitle: "From first assessment to test-ready.",
    pathBody: "Module order is tuned after the first assessment. Your counsellor shifts the focus if one area falls behind.",
    modules: (count: number) => `${count} ${count === 1 ? "module" : "modules"}`,
    startTitle: "Start with a free assessment",
    startBody: "We check your level first, then suggest a timetable.",
    loopEyebrow: "Counsellor-led",
    consultEyebrow: "Free consultation",
    consultTitle: `Your ${program.name} study plan`,
    consultBody: "One session with a counsellor. No charge and no obligation.",
    consultIncludes: "What you get",
    consultItems: ["A starting-level check", "A realistic score or campus target", "A suggested timetable and format", "Clear next steps"],
    faq: "Questions about this program",
    faqBody: "Not answered here? Ask the team directly.",
    others: "Other programs",
    othersTitle: "Looking for a different path?",
    allPrograms: "All programs",
    ready: `Ready to start ${program.name}?`,
    readyBody: "Tell us your score or campus target. The first consultation is free, with no obligation.",
    promises: ["Free first consultation", "Counsellor tracks progress", formatNames.en[program.format]],
  };
}

export function ProgramDetailView({ locale, copy, program, others, faqs, companyName }: Props) {
  const labels = labelsFor(locale, program);
  const consult = `${localePath(locale, "/contact")}#form`;
  const wa = whatsappHref(messageFor(copy.whatsapp.programText, { program: program.name, page: program.name }));
  const crumbs = [
    { name: labels.home, path: "/" },
    { name: copy.nav.programs, path: "/programs" },
    { name: program.name, path: `/programs/${program.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: program.name,
          description: program.summary,
          inLanguage: locale,
          provider: { "@type": "EducationalOrganization", name: companyName },
          ...(program.syllabus.length ? { syllabusSections: program.syllabus.map((item) => ({ "@type": "Syllabus", name: item.title })) } : {}),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-4 pt-10 pb-24 md:px-6 md:pt-14 md:pb-32">
        <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.1),transparent_68%)]" aria-hidden="true" />
        <DashField className="text-logo/40 pointer-events-none absolute top-16 left-[46%] hidden size-16 lg:block" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal className="min-w-0">
            <nav aria-label="Breadcrumb" className="text-muted text-sm">
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

            <p className="bg-accent-soft text-brand mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {program.name}
              {program.tag ? <span className="text-brand/70 font-medium">· {program.tag}</span> : null}
            </p>
            <h1 className="mt-5 max-w-[18ch] text-[clamp(2.3rem,1.2rem+2.4vw,3.6rem)] leading-[1.06] font-semibold tracking-tight text-balance">{program.headline}</h1>
            <p className="text-muted mt-5 max-w-[44ch] text-base leading-7 md:text-lg md:leading-8">{program.summary}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={consult}
                className="bg-brand hover:bg-brand-deep inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <WhatsappButton
                href={wa}
                fallbackHref={consult}
                label={copy.programsIntro.ask}
                page={program.slug}
                program={program.slug}
                className="border-line text-ink hover:bg-logo-soft inline-flex min-h-12 items-center gap-2 rounded-full border bg-white px-6 text-base font-semibold transition-colors"
              >
                <WhatsappIcon className="text-brand size-4" />
                {copy.programsIntro.ask}
              </WhatsappButton>
            </div>

            <ul className="text-muted mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {labels.promises.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check className="text-brand size-4" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[27rem] lg:max-w-none">
            <div className="bg-accent-soft pointer-events-none absolute top-6 -right-4 size-52 rounded-[46%_54%_60%_40%] sm:size-60" aria-hidden="true" />
            <div className="absolute inset-y-0 right-[4%] left-[8%] overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_rgb(42_45_52/0.14)]">
              <Image src={program.image} alt={program.imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 460px, 85vw" priority />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#2a2d3480_100%)]" />
            </div>
            {program.duration ? (
              <div className="absolute bottom-6 left-0 z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_rgb(42_45_52/0.16)]">
                <span className="bg-accent-soft text-brand grid size-10 place-items-center rounded-xl">
                  <Clock3 className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="text-muted block text-xs font-medium">{labels.duration}</span>
                  <span className="text-ink block max-w-[14rem] truncate text-sm font-semibold">{program.duration}</span>
                </span>
              </div>
            ) : null}
            <div className="bg-brand absolute top-6 left-0 z-10 rounded-2xl px-3.5 py-3 text-white shadow-[0_14px_30px_rgb(37_60_161/0.28)] lg:-left-4">
              <p className="text-xs font-medium text-white/75">{program.tag || copy.programsIntro.eyebrow}</p>
              <p className="mt-0.5 text-sm font-semibold">{labels.modules(program.syllabus.length)}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Audience + outcomes */}
      <section className="bg-surface relative px-4 pb-16 md:px-6 md:pb-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute bottom-0 left-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.2),transparent_68%)]" />
        </div>
        <div className="h-16" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <Reveal className="bg-brand relative h-fit overflow-hidden rounded-[1.75rem] p-7 text-white shadow-[0_24px_50px_rgb(37_60_161/0.22)] md:p-9 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <DashField className="pointer-events-none absolute right-6 bottom-6 size-20 text-white/15" />
            <span className="grid size-12 place-items-center rounded-2xl bg-white/12">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">{labels.forWho}</h2>
            <p className="mt-4 max-w-[36ch] text-base leading-7 text-white/85">{program.targetAudience}</p>
            <div className="mt-8 rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold">{labels.unsure}</p>
              <p className="mt-1 text-sm leading-6 text-white/75">{labels.unsureBody}</p>
              <Link href={consult} className="text-brand mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5">
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-brand text-sm font-semibold tracking-wide uppercase">{labels.outcomes}</p>
              <h2 className="mt-2 max-w-[22ch] text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{labels.outcomesBody}</h2>
            </Reveal>
            <Stagger as="ol" className="mt-8 grid gap-4">
              {program.outcomes.map((item, index) => (
                <StaggerItem key={item} as="li" className="interactive-lift flex items-start gap-4 rounded-[1.5rem] bg-white p-5 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                  <span className="bg-accent-soft text-brand grid size-10 shrink-0 place-items-center rounded-full">
                    <Check className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-logo font-mono text-xs tracking-[0.18em]">{String(index + 1).padStart(2, "0")}</p>
                    <p className="text-ink mt-1 text-base leading-7">{item}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Syllabus as a learning path */}
      {program.syllabus.length ? (
        <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
          <div className="pointer-events-none absolute top-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.08),transparent_68%)]" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
              <p className="text-brand inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                <Route className="size-4" aria-hidden="true" />
                {labels.path}
              </p>
              <h2 className="mt-3 max-w-[16ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{labels.pathTitle}</h2>
              <p className="text-muted mt-4 max-w-[38ch] text-base leading-7">{labels.pathBody}</p>
              <div className="border-line bg-surface mt-8 rounded-[1.5rem] border p-5">
                <p className="text-ink flex items-center gap-2 font-semibold">
                  <Sparkles className="text-brand size-4" aria-hidden="true" />
                  {labels.startTitle}
                </p>
                <p className="text-muted mt-1.5 text-sm leading-6">{labels.startBody}</p>
                <Link href={consult} className="text-brand hover:text-brand-deep mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  {copy.nav.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            <Stagger as="ol" className="relative">
              {program.syllabus.map((module, index) => (
                <StaggerItem key={`${module.title}-${index}`} as="li" className="relative pb-5 pl-16 last:pb-0">
                  {/* Rail between step markers */}
                  {index < program.syllabus.length - 1 ? (
                    <span className="absolute top-12 bottom-0 left-[1.4rem] w-px bg-[linear-gradient(to_bottom,var(--line)_60%,transparent_0)] bg-[length:1px_8px]" aria-hidden="true" />
                  ) : null}
                  <span
                    className={`absolute top-1 left-0 grid size-11 place-items-center rounded-full font-mono text-sm font-semibold ${
                      index === 0 ? "bg-brand text-white shadow-[0_10px_24px_rgb(37_60_161/0.3)]" : "border-line text-brand border bg-white"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="interactive-lift border-line rounded-[1.35rem] border bg-white p-5 shadow-[0_10px_28px_rgb(42_45_52/0.05)]">
                    <h3 className="text-ink text-lg font-semibold tracking-tight">{module.title}</h3>
                    {module.body ? <p className="text-muted mt-1.5 text-sm leading-6">{module.body}</p> : null}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Counsellor loop */}
      <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(146_148_153/0.18)_1px,transparent_1.2px)] bg-[size:18px_18px] opacity-60" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl">
          <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-brand text-sm font-semibold tracking-wide uppercase">{labels.loopEyebrow}</p>
              <h2 className="mt-2 max-w-[22ch] text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{copy.counsellor.title}</h2>
            </div>
            <Link href={localePath(locale, "/counselling")} className="text-brand hover:text-brand-deep inline-flex items-center gap-1.5 text-sm font-semibold">
              {copy.counsellor.link}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Stagger as="ol" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {copy.counsellor.steps.map((step, index) => (
              <StaggerItem key={step.title} as="li" className="interactive-lift relative rounded-[1.35rem] bg-white p-5 shadow-[0_14px_36px_rgb(42_45_52/0.06)]">
                <p className="text-logo font-mono text-xs tracking-[0.18em]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="text-ink mt-2 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="text-muted mt-1.5 text-sm leading-6">{step.body}</p>
                {index < copy.counsellor.steps.length - 1 ? (
                  <ArrowRight className="text-brand absolute top-1/2 -right-3 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white p-0.5 shadow lg:block" aria-hidden="true" />
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Free consultation + FAQ */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Reveal className="border-line h-fit overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_22px_50px_rgb(42_45_52/0.1)] lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <div className="bg-header relative overflow-hidden p-7 text-white md:p-8">
              <div className="pointer-events-none absolute -right-10 -bottom-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.55),transparent_68%)]" aria-hidden="true" />
              <p className="relative inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white/70 uppercase">
                <Sparkles className="size-4" aria-hidden="true" />
                {labels.consultEyebrow}
              </p>
              <p className="relative mt-3 text-[clamp(1.6rem,1.2rem+1vw,2.1rem)] leading-tight font-semibold tracking-tight">{labels.consultTitle}</p>
              <p className="relative mt-3 max-w-[34ch] text-sm leading-6 text-white/70">{labels.consultBody}</p>
            </div>
            <div className="p-7 md:p-8">
              <p className="text-ink text-sm font-semibold">{labels.consultIncludes}</p>
              <ul className="mt-4 space-y-3">
                {labels.consultItems.map((item) => (
                  <li key={item} className="text-ink flex items-start gap-3 text-sm leading-6">
                    <span className="bg-accent-soft text-brand mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={consult}
                className="bg-brand hover:bg-brand-deep mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white transition-colors"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-brand text-sm font-semibold tracking-wide uppercase">{copy.faqIntro.eyebrow}</p>
              <h2 className="mt-2 max-w-[20ch] text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{labels.faq}</h2>
              <p className="text-muted mt-3 text-base leading-7">{labels.faqBody}</p>
            </Reveal>
            <Reveal delay={0.08} className="mt-8">
              {faqs.length ? (
                <FaqList items={faqs} />
              ) : (
                <p className="border-line text-muted rounded-[var(--radius-card)] border border-dashed px-5 py-8">
                  Ask the team about {program.name}: schedules, levels, and what the first weeks look like.
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Other programs */}
      {others.length ? (
        <section className="bg-surface relative overflow-hidden px-4 py-16 md:px-6 md:py-24">
          <DashField className="text-logo/40 pointer-events-none absolute top-10 right-10 size-24" />
          <Reveal className="relative mx-auto mb-10 flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-brand text-sm font-semibold tracking-wide uppercase">{labels.others}</p>
              <h2 className="mt-2 text-[clamp(1.75rem,1rem+1.3vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{labels.othersTitle}</h2>
            </div>
            <Link href={localePath(locale, "/programs")} className="text-brand hover:text-brand-deep inline-flex items-center gap-1.5 text-sm font-semibold">
              {labels.allPrograms}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-3">
            {others.slice(0, 3).map((other) => (
              <StaggerItem key={other.slug} as="li">
                <Link
                  href={localePath(locale, `/programs/${other.slug}`)}
                  className="interactive-lift group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgb(42_45_52/0.08)]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image src={other.image} alt={other.imageAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 30vw, 100vw" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,#2a2d34b0_100%)]" />
                    {other.tag ? <span className="text-ink absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">{other.tag}</span> : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="text-ink text-xl font-semibold tracking-tight">{other.name}</h3>
                    <p className="text-muted mt-2 line-clamp-2 text-sm leading-6">{other.summary}</p>
                    <span className="text-brand mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold">
                      {copy.programsIntro.see}
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      {/* Closing CTA */}
      <section className="bg-header relative overflow-hidden px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute -right-10 bottom-0 size-64 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.45),transparent_68%)]" aria-hidden="true" />
        <DashField className="pointer-events-none absolute top-8 left-8 size-16 text-white/20" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{labels.ready}</h2>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-white/75">{labels.readyBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={consult} className="bg-brand inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5">
              {copy.nav.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <WhatsappButton
              href={wa}
              fallbackHref={consult}
              label={copy.programsIntro.ask}
              page={program.slug}
              program={program.slug}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <WhatsappIcon className="size-4" />
              {copy.programsIntro.ask}
            </WhatsappButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
