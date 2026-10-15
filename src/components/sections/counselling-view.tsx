import { WhatsappIcon } from "@/components/layout/social-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Bundle, CounsellorContent } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, Check, RefreshCw, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const portraitTilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"] as const;

export function CounsellingView({
  locale,
  copy,
  counsellors,
}: {
  locale: Locale;
  copy: Bundle;
  counsellors: CounsellorContent[];
}) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.counselling, path: "/counselling" },
  ];
  const labels = {
    loop: "The care loop",
    next: "Want someone watching the plan?",
    nextBody:
      "Tell us the score or campus target. We pair a tutor with a counsellor who keeps progress moving.",
    ask: "Ask on WhatsApp",
    seeTeam: "Meet the desk",
  };
  const team = copy.counsellorsIntro;
  const roster = [...counsellors].sort((a, b) => Number(b.active) - Number(a.active));
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.nav.counselling }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* Soft ambient hero — not full-bleed cinema, not programs collage */}
      <section className="relative overflow-hidden bg-surface px-4 pt-10 pb-16 md:px-6 md:pt-14 md:pb-24">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.12),transparent_68%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 bg-[radial-gradient(circle,rgb(146_148_153/0.35)_1.2px,transparent_1.5px)] bg-[size:12px_12px] opacity-60"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
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

            <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-brand uppercase">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {copy.counsellingPage.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,1.3rem+2.8vw,4rem)] leading-[1.02] font-semibold tracking-tight text-balance">
              {copy.counsellingPage.title}
            </h1>
            <p className="mt-5 max-w-[40ch] text-base leading-7 text-muted md:text-lg md:leading-8">{copy.counsellingPage.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={consult}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {copy.nav.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {roster.length ? (
                <a
                  href="#team"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft"
                >
                  {labels.seeTeam}
                </a>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-brand/10 blur-2xl" aria-hidden="true" />
            <div className="interactive-lift relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_24px_50px_rgb(42_45_52/0.12)] md:p-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-logo uppercase">{copy.counsellor.checksTitle}</p>
              <ul className="mt-4 divide-y divide-line">
                {copy.counsellor.checks.map((check) => (
                  <li key={check} className="flex items-center gap-3 py-3 text-base font-semibold text-ink">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-brand">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Horizontal care loop */}
      <section id="loop" className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <Reveal className="relative mx-auto mb-12 w-full max-w-6xl md:mb-14">
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">{labels.loop}</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
            {copy.counsellor.title}
          </h2>
          <p className="mt-4 max-w-[44ch] text-base leading-7 text-muted">{copy.counsellor.body}</p>
        </Reveal>

        <Stagger as="ol" className="relative mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.counsellor.steps.map((step, index) => (
            <StaggerItem key={step.title} as="li" className="relative">
              <div className="flex h-full flex-col border-t-2 border-brand/30 pt-5 transition-colors hover:border-brand">
                <p className="font-mono text-xs tracking-[0.2em] text-logo">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="relative mx-auto mt-14 w-full max-w-6xl" delay={0.1}>
          <p className="text-sm font-semibold text-brand">{copy.counsellor.checksTitle}</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {copy.counsellor.checks.map((check) => (
              <li key={check} className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-brand">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {check}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Portrait gallery — same card language as tutors. Left out until the CMS has published counsellors. */}
      {roster.length ? (
      <section id="team" className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <Reveal className="relative mx-auto mb-10 w-full max-w-6xl md:mb-14">
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">{team.eyebrow}</p>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
            {team.title}
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-7 text-muted">{team.body}</p>
        </Reveal>

        <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {roster.map((counsellor, index) => {
            const personWa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: counsellor.name }));
            const tilt = portraitTilts[index % portraitTilts.length];
            return (
              <StaggerItem key={counsellor.slug} as="li" className={tilt}>
                <article className="interactive-lift flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-[linear-gradient(160deg,#eceeef_0%,#e9ecf5_55%,#dfe3ee_100%)]">
                  <div className="relative aspect-[3/4] p-4 sm:p-5">
                    {counsellor.photo ? (
                      <div className="absolute inset-0">
                        <Image src={counsellor.photo} alt="" fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(42_45_52/0.88)_100%)]" />
                      </div>
                    ) : null}

                    <div className={`relative flex h-full flex-col justify-between ${counsellor.photo ? "text-white" : ""}`}>
                      {counsellor.photo ? (
                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold backdrop-blur-sm sm:text-xs ${
                            counsellor.active ? "bg-white/90 text-brand" : "bg-white/70 text-muted"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${counsellor.active ? "bg-brand" : "bg-logo"}`}
                            aria-hidden="true"
                          />
                          {counsellor.active ? team.statusActive : team.statusAway}
                        </span>
                      ) : (
                        <span className="grid size-12 place-items-center rounded-full bg-white/70 text-logo sm:size-14">
                          <UserRound className="size-6 sm:size-7" aria-hidden="true" />
                        </span>
                      )}

                      <div>
                        {!counsellor.photo ? (
                          <span
                            className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold sm:text-xs ${
                              counsellor.active ? "bg-white/90 text-brand" : "bg-white/70 text-muted"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${counsellor.active ? "bg-brand" : "bg-logo"}`}
                              aria-hidden="true"
                            />
                            {counsellor.active ? team.statusActive : team.statusAway}
                          </span>
                        ) : null}
                        <h3 className={`text-sm leading-snug font-semibold tracking-tight sm:text-base ${counsellor.photo ? "text-white" : "text-ink"}`}>
                          {counsellor.name}
                        </h3>
                        <p className={`mt-1 text-xs sm:text-sm ${counsellor.photo ? "text-white/75" : "text-muted"}`}>{counsellor.role}</p>
                        <p className={`mt-2 line-clamp-2 text-[0.7rem] leading-5 sm:text-xs ${counsellor.photo ? "text-white/70" : "text-muted"}`}>
                          {counsellor.specialisations.join(" · ")}
                        </p>
                        <p className={`mt-1 line-clamp-1 text-[0.65rem] sm:text-xs ${counsellor.photo ? "text-white/60" : "text-logo"}`}>
                          {counsellor.countries.join(", ")}
                        </p>
                        <WhatsappButton
                          href={personWa}
                          fallbackHref={consult}
                          label={team.ask}
                          page="counselling"
                          className={`mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.7rem] font-semibold transition-colors sm:min-h-10 sm:px-4 sm:text-xs ${
                            counsellor.photo
                              ? "bg-white text-brand hover:bg-white/90"
                              : "bg-brand text-white hover:bg-brand-deep"
                          }`}
                        >
                          <WhatsappIcon className="size-3.5" />
                          {team.ask}
                        </WhatsappButton>
                      </div>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
      ) : null}

      {/* Three truths — large type, no card chrome */}
      <section className="relative overflow-hidden bg-header px-4 py-16 text-white md:px-6 md:py-24">
        <div className="pointer-events-none absolute -right-20 top-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.55),transparent_68%)]" aria-hidden="true" />
        <Stagger as="ul" className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
          {copy.counsellingPage.blocks.map((block, index) => (
            <StaggerItem key={block.heading} as="li">
              <p className="font-display text-5xl leading-none text-white/15 select-none" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">{block.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75 md:text-base">{block.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <Reveal className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative h-64 overflow-hidden rounded-[1.75rem] sm:h-80">
            <Image src="/images/study.jpg" alt="" fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div>
            <h2 className="max-w-[16ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
              {labels.next}
            </h2>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-muted">{labels.nextBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
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
                page="counselling"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft"
              >
                <WhatsappIcon className="size-4 text-brand" />
                {labels.ask}
              </WhatsappButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
