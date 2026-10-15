import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Program } from "@/lib/programs/types";
import type { Locale } from "@/i18n/routing";
import { cn, localePath } from "@/lib/utils";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function WaveCap() {
  return (
    <svg viewBox="0 0 320 72" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-[4.5rem] w-full text-white" aria-hidden="true">
      <path d="M0 0h320v28c-48 0-72 40-160 40S48 28 0 28V0z" fill="currentColor" />
    </svg>
  );
}

export function ProgramsShowcase({
  locale,
  intro,
  programs,
  className,
}: {
  locale: Locale;
  intro: Pick<Bundle["programsIntro"], "eyebrow" | "title" | "body" | "see">;
  programs: Program[];
  className?: string;
}) {
  return (
    <section id="programs" className={cn("relative overflow-hidden bg-surface px-4 py-20 md:px-6 md:py-24", className)}>
      <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.2),transparent_68%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-6 bottom-8 text-logo/40" aria-hidden="true">
        <svg viewBox="0 0 120 90" className="h-20 w-28">
          <path d="M8 70c28-22 40 8 56-10s28-8 48 6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" />
          <path d="M12 58c26-20 38 8 52-8s26-8 46 6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" />
          <path d="M16 46c24-18 36 8 48-6s24-8 44 6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" />
        </svg>
      </div>

      <Reveal className="relative mx-auto grid w-full max-w-6xl items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {intro.eyebrow}
          </p>
          <h2 className="mt-5 max-w-[14ch] text-[clamp(2rem,1.1rem+1.6vw,3.15rem)] leading-[1.08] font-semibold tracking-tight">
            {intro.title}
          </h2>
        </div>
        <p className="max-w-[36ch] text-base leading-7 text-muted lg:justify-self-end lg:text-right">{intro.body}</p>
      </Reveal>

      <Stagger as="ul" className="relative mx-auto mt-12 grid w-full max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {programs.map((program) => {
          // The name comes from the CMS, so editors control what the card says.
          const title = program.name;
          return (
            <StaggerItem key={program.slug} as="li">
              <article className="interactive-lift group relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgb(11_16_32/0.06)]">
                <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-5 pb-2">
                  <h3 className="max-w-[10ch] pt-1 text-xl leading-snug font-semibold tracking-tight text-ink">{title}</h3>
                  <Link
                    href={localePath(locale, `/programs/${program.slug}`)}
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgb(37_60_161/0.28)] transition-transform hover:-translate-y-0.5 hover:scale-105"
                    aria-label={`${intro.see}: ${title}`}
                  >
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </Link>
                </div>

                <div className="relative h-64 overflow-hidden sm:h-72">
                  <Image src={program.image} alt={program.imageAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" />
                  <WaveCap />
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
