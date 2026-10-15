"use client";

import { track } from "@/lib/analytics/track";
import { isLive, type SponsorAd } from "@/lib/sponsors/select";
import { cn } from "@/lib/utils";
import { ArrowUpRight, GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Fires once when at least half the element has been on screen for a full second (IAB viewability). */
export function useViewable(onView: () => void, key: string) {
  const ref = useRef<HTMLElement>(null);
  const callback = useRef(onView);
  useEffect(() => {
    callback.current = onView;
  });
  useEffect(() => {
    const element = ref.current;
    if (!element || !key) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.5) return;
        timer = setTimeout(() => {
          callback.current();
          observer.disconnect();
        }, 1000);
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [key]);
  return ref;
}

export function Label({ text, advertiser, tone = "light" }: { text: string; advertiser?: string; tone?: "light" | "dark" | "overlay" }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 text-xs font-semibold">
      <span
        className={cn(
          "rounded-full px-2.5 py-1 tracking-wide uppercase",
          tone === "dark" ? "bg-white/15 text-white" : tone === "overlay" ? "bg-white/90 text-ink backdrop-blur-sm" : "bg-logo-soft text-muted",
        )}
      >
        {text}
      </span>
      {advertiser ? <span className={cn("truncate", tone === "dark" ? "text-white/70" : "text-muted")}>{advertiser}</span> : null}
    </span>
  );
}

/** University campaigns whose dates include today (Medan time). Empty during server render. */
export function useLiveUniversityAds(ads: SponsorAd[]) {
  const ids = useSyncExternalStore(
    subscribe,
    () => ads.filter((ad) => isLive(ad, Date.now())).map((ad) => ad.id).join(","),
    () => "",
  );
  return ads.filter((ad) => ids.split(",").includes(ad.id));
}

function linkProps(ad: SponsorAd) {
  return {
    href: ad.href,
    target: "_blank",
    rel: "sponsored noopener noreferrer",
    onClick: () => track({ name: "ad_click", slot: "universities", campaign: ad.id }),
  };
}

function useImpression(ad: SponsorAd) {
  return useViewable(() => track({ name: "ad_impression", slot: "universities", campaign: ad.id }), ad.id);
}

function Majors({ majors, label }: { majors: string[]; label: string }) {
  if (!majors.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {majors.slice(0, 4).map((major) => (
        <li key={major} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-brand">
          {major}
        </li>
      ))}
      {majors.length > 4 ? <li className="rounded-full bg-logo-soft px-2.5 py-1 text-xs font-semibold text-muted">+{majors.length - 4}</li> : null}
    </ul>
  );
}

/** Card for the home universities grid. */
export function SponsoredUniversityCard({ ad, label, majorsLabel }: { ad: SponsorAd; label: string; majorsLabel: string }) {
  const ref = useImpression(ad);
  return (
    <article ref={ref as never} className="h-full">
      <a
        {...linkProps(ad)}
        className="interactive-lift group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_44px_rgb(11_16_32/0.08)] ring-2 ring-brand/15"
      >
        <div className="relative h-48 overflow-hidden">
          <Image src={ad.image ?? ""} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
          {ad.country ? <span className="absolute top-3 left-3 rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">{ad.country}</span> : null}
          <span className="absolute top-3 right-3">
            <Label text={label} tone="overlay" />
          </span>
        </div>
        <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
          <div className="flex items-center gap-2.5">
            {ad.logo ? (
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-line bg-white">
                <Image src={ad.logo} alt="" fill className="object-contain p-1" sizes="36px" />
              </span>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-brand">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
            )}
            <p className="truncate text-sm font-medium text-muted">{[ad.advertiser, ad.city].filter(Boolean).join(" · ")}</p>
          </div>
          <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight text-ink">{ad.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{ad.body}</p>
          <div className="mt-4 border-t border-line pt-4">
            <Majors majors={ad.majors} label={majorsLabel} />
          </div>
          <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors group-hover:bg-brand-deep">
            {ad.cta}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </a>
    </article>
  );
}

/** Row for the study abroad directory, matching its list layout. */
export function SponsoredUniversityRow({ ad, label, majorsLabel }: { ad: SponsorAd; label: string; majorsLabel: string }) {
  const ref = useImpression(ad);
  return (
    <article ref={ref as never}>
      <a
        {...linkProps(ad)}
        className="group grid gap-4 rounded-[1.25rem] bg-accent-soft/40 px-3 py-5 transition-colors hover:bg-accent-soft sm:grid-cols-[7.5rem_1fr_auto] sm:items-center sm:gap-6 md:py-6"
      >
        <div className="relative h-28 overflow-hidden rounded-[1.1rem] sm:h-24 sm:w-[7.5rem]">
          <Image src={ad.image ?? ""} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="120px" />
        </div>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <Label text={label} />
            {ad.country ? <span className="font-semibold text-brand">{ad.country}</span> : null}
            {ad.city ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {ad.city}
                </span>
              </>
            ) : null}
          </p>
          <h3 className="mt-1.5 flex items-center gap-2 text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-brand md:text-xl">
            <GraduationCap className="size-5 shrink-0 text-brand" aria-hidden="true" />
            {ad.advertiser}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
            <span className="font-medium text-ink">{ad.title}.</span> {ad.body}
          </p>
          <div className="mt-3">
            <Majors majors={ad.majors} label={majorsLabel} />
          </div>
        </div>
        <span className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors group-hover:bg-brand-deep sm:self-center">
          {ad.cta}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </a>
    </article>
  );
}
