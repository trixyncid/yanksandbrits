import { WhatsappIcon } from "@/components/layout/social-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { WhatsappButton } from "@/components/layout/trackers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { messageFor, whatsappHref } from "@/lib/content";
import { expoDateLabel } from "@/lib/expos/format";
import type { Expo } from "@/lib/expos/schema";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** The Expo page. The lineup comes from the CMS (Expos); `copy` supplies headings and labels. */
export function ExpoView({ locale, copy, expos }: { locale: Locale; copy: Bundle; expos: Expo[] }) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const page = copy.expoPage;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.expo, path: "/expo" },
  ];
  const wa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: copy.nav.expo }));
  const seeLineup = "See the lineup";
  const dated = expos.filter((expo) => expo.startsAt);
  // Search engines can show dated expos as events; ones awaiting a date are left out.
  const events = dated.map((expo) => ({
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: expo.name,
    description: expo.summary,
    startDate: expo.startsAt,
    ...(expo.endsAt ? { endDate: expo.endsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: expo.venue || expo.city, address: { "@type": "PostalAddress", addressLocality: expo.city, addressCountry: "ID" } },
    ...(expo.image ? { image: expo.image } : {}),
  }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      {events.map((event) => (
        <JsonLd key={`${event.name}-${event.startDate}`} data={event} />
      ))}

      <section className="relative overflow-hidden bg-header text-white">
        <Image
          src="/images/dest-sg.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgb(42_45_52/0.92)_0%,rgb(37_60_161/0.75)_55%,rgb(42_45_52/0.88)_100%)]" />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: "repeating-linear-gradient(-18deg, transparent, transparent 18px, rgb(255 255 255 / 0.08) 18px, rgb(255 255 255 / 0.08) 36px)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pt-10 pb-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pt-14 md:pb-20 lg:gap-14">
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

            <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
              <Ticket className="size-4" aria-hidden="true" />
              {page.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.6rem,1.3rem+3vw,4.25rem)] leading-[1.02] font-semibold tracking-tight text-balance">
              {page.title}
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-7 text-white/80 md:text-lg md:leading-8">{page.body}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#lineup"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {seeLineup}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <WhatsappButton
                href={wa}
                fallbackHref={consult}
                label={page.ask}
                page="expo"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <WhatsappIcon className="size-4" />
                {page.ask}
              </WhatsappButton>
            </div>
          </Reveal>

          {expos.length ? (
          <Reveal delay={0.12}>
            <nav aria-label={page.lineupTitle} className="rounded-[1.5rem] bg-white/10 p-3 backdrop-blur-sm">
              <ol className="grid gap-2">
                {expos.map((event, index) => (
                  <li key={event.slug}>
                    <a
                      href={`#${event.slug}`}
                      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/10"
                    >
                      <span className="font-mono text-xs tracking-[0.16em] text-white/50">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-semibold text-white group-hover:underline">{event.name}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
          ) : null}
        </div>
      </section>

      <section id="lineup" className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <div className="relative mx-auto w-full max-w-6xl">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">{page.lineupEyebrow}</p>
            <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
              {page.lineupTitle}
            </h2>
            <p className="mt-4 max-w-[48ch] text-base leading-7 text-muted">
              {dated.length === 0 ? page.lineupNote : null}
            </p>
          </Reveal>

          {expos.length === 0 ? <p className="mt-10 rounded-[1.5rem] bg-surface px-6 py-10 text-center text-base text-muted">{copy.previews.expo.empty}</p> : null}
          <Stagger as="ul" className="mt-12 grid gap-6 lg:grid-cols-2">
            {expos.map((event) => {
              const date = expoDateLabel(event);
              const place = [event.venue, event.city].filter(Boolean).join(", ") || page.venueValue;
              const eventWa = whatsappHref(messageFor(copy.whatsapp.pageText, { page: event.name }));
              return (
                <StaggerItem key={event.slug} as="li">
                  <article id={event.slug} className="interactive-lift group grid scroll-mt-28 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_44px_rgb(42_45_52/0.08)] sm:grid-cols-[9.5rem_1fr]">
                    {event.image ? (
                    <div className="relative h-40 sm:h-full sm:min-h-[16rem]">
                      <Image
                        src={event.image}
                        alt={event.imageAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 640px) 152px, 100vw"
                      />
                    </div>
                    ) : (
                      <div className="hidden bg-accent-soft sm:grid sm:place-items-center" aria-hidden="true">
                        <Ticket className="size-8 text-brand/50" />
                      </div>
                    )}
                    <div className="flex flex-col p-5 md:p-6">
                      <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3">
                        <h3 className="text-xl font-semibold tracking-tight text-ink">{event.name}</h3>
                        <Ticket className="size-5 shrink-0 text-brand" aria-hidden="true" />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-muted">{event.summary}</p>
                      <dl className="mt-4 space-y-2 text-sm">
                        {event.audience ? (
                        <div className="flex items-start gap-2">
                          <Users className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                          <div>
                            <dt className="text-xs font-semibold tracking-wide text-logo uppercase">{page.audienceLabel}</dt>
                            <dd className="text-ink">{event.audience}</dd>
                          </div>
                        </div>
                        ) : null}
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                          <div>
                            <dt className="text-xs font-semibold tracking-wide text-logo uppercase">{page.dateLabel}</dt>
                            <dd className={date ? "font-semibold text-ink" : "text-ink"}>{date ? <time dateTime={event.startsAt!}>{date}</time> : page.datePending}</dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                          <div>
                            <dt className="text-xs font-semibold tracking-wide text-logo uppercase">{page.venueLabel}</dt>
                            <dd className="text-ink">{place}</dd>
                          </div>
                        </div>
                      </dl>
                      {event.covers.length ? (
                        <>
                          <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-logo uppercase">{page.coversLabel}</p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {event.covers.map((item) => (
                              <li key={item} className="rounded-full bg-logo-soft px-3 py-1 text-xs font-medium text-ink">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {event.registerUrl ? (
                          <a
                            href={event.registerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                          >
                            {page.register}
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                          </a>
                        ) : (
                          <Link
                            href={consult}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                          >
                            {page.register}
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        )}
                        <WhatsappButton
                          href={eventWa}
                          fallbackHref={consult}
                          label={page.ask}
                          page="expo"
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-logo-soft"
                        >
                          <WhatsappIcon className="size-4 text-brand" />
                          {page.ask}
                        </WhatsappButton>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>


      <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(146_148_153/0.2)_1px,transparent_1.2px)] bg-[size:18px_18px] opacity-50" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[16ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
              {page.next}
            </h2>
            <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted">{page.nextBody}</p>
          </div>
          <Link
            href={consult}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {page.register}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
