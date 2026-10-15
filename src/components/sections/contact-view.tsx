import { LeadForm } from "@/components/forms/lead-form";
import { FaqList } from "@/components/layout/faq-list";
import { SectionTitle } from "@/components/layout/section";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { ProgramLink } from "@/lib/programs/types";
import { messageFor, whatsappHref } from "@/lib/content";
import type { Faq } from "@/lib/faqs/schema";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { branches, mapsHref, openingHours } from "@/content/branches";

function MarkedTitle({ title, highlight }: { title: string; highlight: string }) {
  const index = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (!highlight || index < 0) return title;
  return (
    <>
      {title.slice(0, index)}
      <span className="relative inline-block">
        {title.slice(index, index + highlight.length)}
        <svg aria-hidden="true" viewBox="0 0 140 16" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full text-white/90">
          <path d="M2 11C22 3 38 15 62 8s34 8 76-5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </span>
      {title.slice(index + highlight.length)}
    </>
  );
}

/** `faqs`: the questions marked "Show on the Contact page" in the CMS. */
export function ContactView({ locale, copy, programs, faqs }: { locale: Locale; copy: Bundle; programs: ProgramLink[]; faqs: Faq[] }) {
  const text = copy.contact;
  const form = "#form";
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.contact, path: "/contact" },
  ];
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.nav.contact }));
  const linkClass = "inline-flex min-h-11 items-center gap-1.5 transition-colors";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* 1. Hero + form — the conversion point sits above the fold */}
      <section className="bg-header relative isolate overflow-hidden text-white">
        <Image src="/images/class.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" style={{ objectPosition: "62% center" }} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#2a2d34f6_0%,#2a2d34ec_40%,#253ca1d0_70%,#253ca1b0_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 -z-10 size-80 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.55),transparent_68%)]" aria-hidden="true" />

        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16 lg:grid-cols-[1fr_minmax(0,29rem)] lg:items-center lg:gap-14">
          <Reveal className="min-w-0 lg:pt-6">
            <nav aria-label="Breadcrumb" className="text-sm text-white/70">
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

            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <WhatsappIcon className="size-3.5" />
              {text.eyebrow}
            </p>
            <h1 className="mt-5 max-w-[16ch] text-[clamp(2.4rem,1.2rem+2.6vw,3.6rem)] leading-[1.08] font-bold text-balance" style={{ letterSpacing: "-0.015em" }}>
              <MarkedTitle title={text.title} highlight={text.highlight} />
            </h1>
            <p className="mt-6 max-w-[44ch] text-base leading-7 text-white/85 md:text-lg md:leading-8">{text.body}</p>

            <ul className="mt-8 grid gap-3">
              {text.promises.map((promise) => (
                <li key={promise} className="flex items-center gap-3 text-base font-medium">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {promise}
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-white/15 pt-6 text-sm">
              <a href="#branches" className={`${linkClass} font-semibold hover:text-white/80`}>
                <MapPin className="size-4" aria-hidden="true" />
                {text.visitLink}
                <ArrowRight className="size-4 rotate-90" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="text-ink relative min-w-0">
            <div id="form" className="scroll-mt-[calc(var(--header-h)+1rem)]">
              <LeadForm locale={locale} copy={copy.form} programs={programs} whatsappHref={wa} />
            </div>
            <p className="mt-4 text-center text-sm leading-6 text-white/70">{text.formNote}</p>
          </Reveal>
        </div>
      </section>

      {/* 2. Visit — the only other way in: the form, or a branch in person */}
      <section id="branches" className="bg-surface relative scroll-mt-[var(--header-h)] overflow-hidden px-4 pt-12 pb-16 md:px-6 md:pt-16 md:pb-24">
        <div className="pointer-events-none absolute top-8 right-8 size-20 bg-[radial-gradient(circle,var(--logo)_1.2px,transparent_1.5px)] bg-[size:10px_10px]" aria-hidden="true" />
        <Reveal className="relative mx-auto w-full max-w-6xl">
          <p className="text-brand text-sm font-semibold tracking-wide uppercase">{text.visitEyebrow}</p>
          <SectionTitle>{text.visitTitle}</SectionTitle>
          <p className="text-muted mt-4 max-w-[52ch] text-base leading-7">{text.visitBody}</p>
        </Reveal>

        <Stagger as="ul" className="relative mx-auto mt-10 grid w-full max-w-6xl gap-5 md:grid-cols-2">
          {branches.map((branch) => (
            <StaggerItem key={branch.name} as="li">
              <article className="interactive-lift flex h-full flex-col rounded-[1.6rem] bg-white p-6 shadow-[0_16px_40px_rgb(42_45_52/0.06)] md:p-8">
                <span className="bg-accent-soft text-brand grid size-12 place-items-center rounded-full">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{branch.name}</h3>
                <p className="text-brand text-sm font-semibold">{branch.locality}</p>
                <p className="text-ink mt-3 max-w-[40ch] text-base leading-7">{branch.address}</p>
                <div className="text-muted mt-5 flex items-start gap-2.5 text-sm leading-6">
                  <Clock className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-ink font-semibold">{text.hoursLabel}</p>
                    {openingHours.map((slot) => (
                      <p key={slot.days}>
                        {slot.days}: {slot.opens} - {slot.closes} WIB
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <a
                    href={mapsHref(branch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand hover:bg-brand-deep inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors"
                  >
                    {text.directions}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 3. What happens next — removes the "then what?" doubt */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute right-0 bottom-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.08),transparent_68%)]" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="bg-accent-soft text-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">{text.nextEyebrow}</p>
            <SectionTitle className="mt-5">{text.nextTitle}</SectionTitle>
          </div>
          <p className="text-muted max-w-[36ch] text-base leading-7 md:text-right">{text.nextBody}</p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-10 w-full max-w-6xl">
          <ol className="bg-brand grid overflow-hidden rounded-[1.75rem] text-white shadow-[0_24px_50px_rgb(37_60_161/0.22)] md:grid-cols-3">
            {text.steps.map((step, index) => (
              <li key={step.heading} className={`px-6 py-8 md:px-8 md:py-10 ${index > 0 ? "border-t border-white/15 md:border-t-0 md:border-l" : ""}`}>
                <p className="font-mono text-xs tracking-[0.2em] text-white/60">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.heading}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="text-muted mt-4 text-center text-sm leading-6">{copy.finalCta.reassurance}</p>
        </Reveal>
      </section>

      {/* 4. FAQ — answer the objections that stall a submit. Left out when none are marked for this page. */}
      {faqs.length ? (
        <section className="bg-surface relative overflow-hidden px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <Reveal>
              <p className="text-brand text-sm font-semibold tracking-wide uppercase">{text.faqEyebrow}</p>
              <SectionTitle className="max-w-[14ch]">{text.faqTitle}</SectionTitle>
              <p className="text-muted mt-5 max-w-[34ch] text-base leading-7">{text.faqBody}</p>
              <Link href={localePath(locale, "/faq")} className="text-brand hover:text-brand-deep mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors">
                {copy.footer.faq}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <FaqList items={faqs} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* 5. Closing — one last nudge back to the form */}
      <section className="bg-header relative overflow-hidden px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute right-8 bottom-0 size-40 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.5),transparent_68%)]" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{text.closingTitle}</h2>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-white/75">{text.closingBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={form} className="bg-brand inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5">
              {text.closingCta}
              <ArrowRight className="size-4 -rotate-90" aria-hidden="true" />
            </a>
            <a
              href="#branches"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <MapPin className="size-4" aria-hidden="true" />
              {text.closingVisit}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
