"use client";

import { SponsoredUniversityRow, useLiveUniversityAds } from "@/components/ads/sponsored-university";
import type { SponsorAd } from "@/lib/sponsors/select";
import { Reveal } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";

/** University directory, filled from the CMS universities slot. Renders nothing while no campaign is live. */
export function StudyAbroadUniversities({
  intro,
  ads,
  sponsoredLabel,
  majorsLabel,
}: {
  intro: Bundle["universitiesIntro"];
  ads: SponsorAd[];
  sponsoredLabel: string;
  majorsLabel: string;
}) {
  const [filter, setFilter] = useState("all");
  const sponsored = useLiveUniversityAds(ads);
  const reduce = useReducedMotion();
  const filters = useMemo(() => {
    const countries = [...new Set(sponsored.flatMap((ad) => (ad.country ? [ad.country] : [])))];
    return [{ id: "all", label: intro.allFilter }, ...countries.map((country) => ({ id: country, label: country }))];
  }, [intro, sponsored]);
  const visible = filter === "all" ? sponsored : sponsored.filter((ad) => ad.country === filter);

  if (!sponsored.length) return null;

  return (
    <section id="universities" className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute top-10 right-0 size-64 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.1),transparent_68%)]" aria-hidden="true" />

      <Reveal className="relative mx-auto mb-10 w-full max-w-6xl md:mb-12">
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">{intro.eyebrow}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">
            {intro.title}
          </h2>
          <p className="max-w-[34ch] text-base leading-7 text-muted md:text-right">{intro.note}</p>
        </div>
      </Reveal>

      {/* A filter only helps once campaigns span more than one country. */}
      {filters.length > 2 ? (
        <div
          className="relative mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={intro.eyebrow}
        >
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active ? "bg-brand text-white shadow-[0_8px_20px_rgb(37_60_161/0.25)]" : "bg-logo-soft text-ink hover:bg-accent-soft"
                }`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="relative mx-auto mt-8 grid w-full max-w-6xl gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((ad) => (
            <motion.li
              key={ad.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <SponsoredUniversityRow ad={ad} label={sponsoredLabel} majorsLabel={majorsLabel} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

/** In-page link to the directory, shown only while the directory is. */
export function UniversitiesLink({ ads, label, className, children }: { ads: SponsorAd[]; label: string; className?: string; children?: ReactNode }) {
  const sponsored = useLiveUniversityAds(ads);
  if (!sponsored.length) return null;
  return (
    <a href="#universities" className={className}>
      {label}
      {children}
    </a>
  );
}
