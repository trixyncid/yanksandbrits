import { Reveal } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { localePath } from "@/lib/utils";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import Link from "next/link";

export function JourneyShowcase({
  locale,
  journey,
  href,
}: {
  locale: Locale;
  journey: Pick<Bundle["journey"], "eyebrow" | "title" | "body" | "cta" | "columns">;
  href?: string;
}) {
  const ctaHref = href ?? `${localePath(locale, "/contact")}#form`;

  return (
    <section id="journey" className="relative overflow-hidden px-4 py-20 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(146_148_153/0.22)_1px,transparent_1.2px)] bg-[size:18px_18px] opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute top-8 right-10 text-logo/35" aria-hidden="true">
        <svg viewBox="0 0 140 140" className="size-32">
          <circle cx="70" cy="70" r="54" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 6" />
          <circle cx="70" cy="70" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 6" />
          <circle cx="70" cy="70" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 6" />
        </svg>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.2fr] lg:gap-14">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {journey.eyebrow}
          </p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,1.1rem+1.6vw,3.15rem)] leading-[1.08] font-semibold tracking-tight">
            {journey.title}
          </h2>
          <p className="mt-5 max-w-[36ch] text-base leading-7 text-muted">{journey.body}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            {journey.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={0.12} className="relative overflow-hidden rounded-[1.75rem] bg-brand px-6 py-8 text-white shadow-[0_24px_50px_rgb(37_60_161/0.22)] md:px-8 md:py-10">
          <div className="pointer-events-none absolute -right-10 -bottom-16 font-display text-[12rem] leading-none text-white/10 select-none" aria-hidden="true">
            e
          </div>
          <div className="relative grid gap-10 md:grid-cols-2 md:gap-8">
            {journey.columns.map((column, index) => (
              <div key={column.title} className={index > 0 ? "md:border-l md:border-white/15 md:pl-8" : ""}>
                <h3 className="text-xl font-semibold tracking-tight">{column.title}</h3>
                <div className="mt-6 space-y-6">
                  {column.groups.map((group) => (
                    <div key={group.heading}>
                      <p className="inline-block border-b border-white/70 pb-1 text-sm font-semibold">{group.heading}</p>
                      <ul className="mt-3 space-y-2.5">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/90">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                              <Check className="size-3" aria-hidden="true" />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
