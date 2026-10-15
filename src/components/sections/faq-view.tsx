import { WhatsappIcon } from "@/components/layout/social-icons";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal } from "@/components/motion/reveal";
import { FaqExplorer } from "@/components/sections/faq-explorer";
import { JsonLd } from "@/components/seo/json-ld";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import type { Faq } from "@/lib/faqs/schema";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

/** The FAQ page: questions from the CMS, searchable and grouped by topic. */
export function FaqView({ locale, copy, faqs }: { locale: Locale; copy: Bundle; faqs: Faq[] }) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: copy.footer.faq, path: "/faq" },
  ];
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.footer.faq }));
  const topics = new Set(faqs.map((faq) => faq.category)).size;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      {faqs.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
          }}
        />
      ) : null}

      <section className="relative overflow-hidden bg-surface px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <div className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.12),transparent_68%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute top-10 right-[8%] hidden font-display text-[12rem] leading-none text-brand/[0.07] select-none md:block" aria-hidden="true">
          ?
        </div>
        <Reveal className="relative mx-auto w-full max-w-4xl">
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
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
            <MessageCircleQuestion className="size-4" aria-hidden="true" />
            {copy.faqIntro.eyebrow}
          </p>
          <h1 className="mt-5 max-w-[18ch] text-[clamp(2.4rem,1.3rem+2.6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance">{copy.faqIntro.title}</h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-8 text-muted">{copy.faqIntro.body}</p>
          {faqs.length ? (
            <p className="mt-4 text-sm text-muted">
              <span className="font-semibold text-ink tabular-nums">{faqs.length}</span> answers across <span className="font-semibold text-ink tabular-nums">{topics}</span> topic{topics === 1 ? "" : "s"}
            </p>
          ) : null}
        </Reveal>
      </section>

      <section className="bg-white px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <FaqExplorer
            faqs={faqs}
            empty={<p className="rounded-[1.6rem] bg-surface px-6 py-12 text-center text-lg text-muted">Answers are being written. Until then, ask us anything on WhatsApp or through the form.</p>}
          />
        </div>
      </section>

      <section className="bg-white px-4 pb-16 md:px-6 md:pb-24">
        <Reveal className="relative mx-auto flex w-full max-w-4xl flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-header p-7 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.6),transparent_68%)]" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-[clamp(1.6rem,1rem+1.1vw,2.2rem)] leading-tight font-semibold tracking-tight">Still have a question?</h2>
            <p className="mt-2 max-w-[38ch] text-white/75">A counsellor answers on WhatsApp within one business day.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <WhatsappButton href={wa} fallbackHref={consult} label="Ask on WhatsApp" page="faq" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-brand transition-transform hover:-translate-y-0.5">
              <WhatsappIcon className="size-4" />
              Ask on WhatsApp
            </WhatsappButton>
            <Link href={consult} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10">
              {copy.nav.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
