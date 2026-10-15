"use client";

import { track } from "@/lib/analytics/track";
import { isLive, type SponsorAd } from "@/lib/sponsors/select";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

/** Each slide stays 7 seconds before the carousel moves on (set by the indicator's animation class). */

export type HeroSlide = {
  /** Set on sponsored slides only. */
  sponsor?: { id: string; advertiser: string };
  title: string;
  highlight?: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  position: string;
};

function MarkedTitle({ title, highlight }: { title: string; highlight?: string }) {
  if (!highlight) return title;
  const index = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (index < 0) return title;
  const before = title.slice(0, index);
  const match = title.slice(index, index + highlight.length);
  const after = title.slice(index + highlight.length);

  return (
    <>
      {before}
      <span className="relative inline">
        {match}
        <svg aria-hidden="true" viewBox="0 0 140 16" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full text-white/90">
          <path d="M2 11C22 3 38 15 62 8s34 8 76-5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </span>
      {after}
    </>
  );
}

function HeroTitle({ title, highlight }: { title: string; highlight?: string }) {
  const pause = title.indexOf(". ");
  if (pause < 0) return <MarkedTitle title={title} highlight={highlight} />;

  return (
    <>
      <span className="md:block">{title.slice(0, pause + 1)}</span>{" "}
      <span className="md:block">
        <MarkedTitle title={title.slice(pause + 2)} highlight={highlight} />
      </span>
    </>
  );
}

function DashMarks() {
  const marks = [
    [8, 10, 18, -28],
    [22, 4, 14, 40],
    [16, 28, 20, -12],
    [34, 18, 12, 55],
    [40, 36, 16, -40],
    [28, 48, 18, 18],
    [48, 12, 10, -8],
    [52, 44, 14, 32],
    [12, 58, 12, 48],
    [36, 62, 16, -22],
  ] as const;

  return (
    <svg aria-hidden="true" viewBox="0 0 70 80" className="pointer-events-none absolute bottom-[24%] left-[54%] hidden h-16 w-14 text-white/90 lg:block">
      {marks.map(([x, y, width, rotate]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height="3.2" rx="1.6" fill="currentColor" transform={`rotate(${rotate} ${x} ${y})`} />
      ))}
    </svg>
  );
}

function SlideControls({
  className,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  className: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className={className}>
      <button
        type="button"
        className="grid size-12 place-items-center rounded-full bg-white text-brand shadow-[0_8px_20px_rgb(42_45_52/0.28)] transition-transform hover:scale-105"
        aria-label={nextLabel}
        onClick={onNext}
      >
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="grid size-12 place-items-center rounded-full border-2 border-white/80 bg-header/50 text-white transition-transform hover:scale-105 md:mr-3"
        aria-label={previousLabel}
        onClick={onPrevious}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** One bar per slide. The active bar fills over the dwell time, and its end moves the carousel on. */
function Indicators({
  count,
  index,
  playing,
  autoplay,
  slideLabel,
  pauseLabel,
  playLabel,
  onSelect,
  onToggle,
  onDone,
}: {
  count: number;
  index: number;
  playing: boolean;
  autoplay: boolean;
  slideLabel: string;
  pauseLabel: string;
  playLabel: string;
  onSelect: (index: number) => void;
  onToggle: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {autoplay ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? pauseLabel : playLabel}
          className="grid size-9 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
        >
          {playing ? <Pause className="size-3.5 fill-current" aria-hidden="true" /> : <Play className="size-3.5 translate-x-px fill-current" aria-hidden="true" />}
        </button>
      ) : null}
      <ol className="flex items-center gap-2">
        {Array.from({ length: count }, (_, slide) => (
          <li key={slide}>
            <button
              type="button"
              onClick={() => onSelect(slide)}
              aria-label={`${slideLabel} ${slide + 1}`}
              aria-current={slide === index ? "true" : undefined}
              className="group grid h-9 place-items-center"
            >
              <span className={`relative block h-1 overflow-hidden rounded-full bg-white/30 transition-[width] duration-500 ${slide === index ? "w-12" : "w-6 group-hover:bg-white/55"}`}>
                {slide === index ? (
                  <span
                    // Restart the fill whenever the slide changes.
                    key={index}
                    className={cn(
                      "absolute inset-0 origin-left rounded-full bg-white",
                      // A class, not an inline style: Tailwind only keeps keyframes that a class uses.
                      autoplay && "animate-[hero-progress_7s_linear_forwards]",
                      autoplay && !playing && "[animation-play-state:paused]",
                    )}
                    onAnimationEnd={onDone}
                  />
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Scribble() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" className="pointer-events-none absolute right-16 bottom-36 hidden h-40 w-48 text-logo md:block lg:right-28 lg:bottom-40">
      <path
        d="M36 118C28 64 86 34 138 52c58 20 78 86 28 118-46 30-104 8-112-36"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="motion-safe:animate-[hero-fade_900ms_ease]"
      />
      <path d="M70 96c22-28 74-16 78 18" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="motion-safe:animate-[hero-fade_1100ms_ease]" />
    </svg>
  );
}

const subscribe = () => () => {};
const seen = new Set<string>();
const titleClass =
  "max-w-full text-[clamp(2.15rem,1.2rem+2.2vw,2.85rem)] leading-[1.1] font-bold text-balance md:text-[clamp(2.1rem,calc((50vw-max(1.5rem,(100vw-72rem)/2+1.5rem))/11),3.5rem)]";

// Sponsored slides go after the first house slide, alternating with the rest.
function interleave(house: HeroSlide[], sponsored: HeroSlide[]) {
  const [first, ...rest] = house;
  const out: HeroSlide[] = first ? [first] : [];
  const length = Math.max(rest.length, sponsored.length);
  for (let i = 0; i < length; i++) {
    if (sponsored[i]) out.push(sponsored[i]);
    if (rest[i]) out.push(rest[i]);
  }
  return out;
}

export function Hero({
  slides: house,
  ads = [],
  sponsoredLabel = "Sponsored",
  previousLabel,
  nextLabel,
  pauseLabel,
  playLabel,
  slideLabel,
}: {
  slides: HeroSlide[];
  /** Campaigns booked for the home-hero slot. Dates are checked here, in the visitor's browser. */
  ads?: SponsorAd[];
  sponsoredLabel?: string;
  previousLabel: string;
  nextLabel: string;
  pauseLabel: string;
  playLabel: string;
  slideLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  // Autoplay rests while the visitor hovers, focuses inside, switches tabs, or presses pause.
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();
  // Empty on the server, so the first render always matches; live campaigns join after hydration.
  const liveIds = useSyncExternalStore(
    subscribe,
    () => ads.filter((ad) => isLive(ad, Date.now())).map((ad) => ad.id).join(","),
    () => "",
  );
  const slides = useMemo(() => {
    const live = ads.filter((ad) => liveIds.split(",").includes(ad.id) && ad.image);
    return interleave(
      house,
      live.map((ad) => ({
        sponsor: { id: ad.id, advertiser: ad.advertiser },
        title: ad.title,
        body: ad.body,
        cta: ad.cta,
        href: ad.href,
        image: ad.image ?? "",
        alt: "",
        position: "center",
      })),
    );
  }, [ads, house, liveIds]);
  const count = slides.length;
  const current = index < count ? index : 0;
  const slide = slides[current];
  // Only a carousel with sponsored slides moves, and never for visitors who asked for less motion.
  const carousel = count > 1;
  const autoplay = carousel && !reduce;
  const playing = autoplay && !paused && !hovering && !focused && !hidden;

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // A sponsored slide counts as seen once it has been the active slide for a full second.
  useEffect(() => {
    if (!slide?.sponsor) return;
    const { id } = slide.sponsor;
    const timer = setTimeout(() => {
      if (seen.has(id)) return;
      seen.add(id);
      track({ name: "ad_impression", slot: "home-hero", campaign: id });
    }, 1000);
    return () => clearTimeout(timer);
  }, [slide]);

  if (!slide) return null;

  const show = (next: number, delta: number) => {
    setDirection(delta);
    setIndex(((next % count) + count) % count);
  };
  const controls = {
    previousLabel,
    nextLabel,
    onPrevious: () => show(current - 1, -1),
    onNext: () => show(current + 1, 1),
  };
  const indicators = (
    <Indicators
      count={count}
      index={current}
      playing={playing}
      autoplay={autoplay}
      slideLabel={slideLabel}
      pauseLabel={pauseLabel}
      playLabel={playLabel}
      onSelect={(next) => show(next, next >= current ? 1 : -1)}
      onToggle={() => setPaused((value) => !value)}
      onDone={() => show(current + 1, 1)}
    />
  );
  // Same easing everywhere so image and text move as one.
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      className="relative isolate min-h-[36rem] overflow-hidden bg-header text-white md:min-h-[42rem]"
      aria-roledescription={carousel ? "carousel" : undefined}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* Images crossfade on top of each other, with a slow settle so the change never feels like a cut. */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`${slide.sponsor?.id ?? "house"}:${slide.image}`}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: 1.6, ease } }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            preload={current === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: slide.position }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#2a2d34f6_0%,#2a2d34e8_24%,#253ca172_48%,#253ca128_64%,transparent_80%)]" />
      <DashMarks />
      <Scribble />
      <div className="relative mx-auto flex min-h-[36rem] w-full max-w-6xl flex-col justify-center px-4 pt-28 pb-40 md:pt-40 md:min-h-[42rem] md:px-6 md:pb-48">
        {/* Announce changes only when the visitor is driving; a rotating announcement would talk over them. */}
        <div className="w-full min-w-0 md:w-[min(100%,calc(50vw-max(1.5rem,(100vw-72rem)/2+1.5rem)))]" aria-live={playing ? "off" : "polite"}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${slide.sponsor?.id ?? "house"}:${slide.title}`}
              custom={direction}
              initial={reduce ? false : { opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: direction * -16 }}
              transition={{ duration: 0.4, ease }}
            >
              {slide.sponsor ? (
                <>
                  <p className="mb-4 inline-flex max-w-full items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 tracking-wide text-ink uppercase">{sponsoredLabel}</span>
                    <span className="truncate text-white/80">{slide.sponsor.advertiser}</span>
                  </p>
                  {/* Not the page heading: the h1 belongs to the site's own first slide. */}
                  <p className={titleClass} style={{ letterSpacing: "-0.015em" }}>
                    {slide.title}
                  </p>
                </>
              ) : (
                <h1 className={titleClass} style={{ letterSpacing: "-0.015em" }}>
                  <HeroTitle title={slide.title} highlight={slide.highlight} />
                </h1>
              )}
              <p className="mt-5 text-base leading-7 text-white/85 md:text-lg">{slide.body}</p>
              {slide.sponsor ? (
                <a
                  href={slide.href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => track({ name: "ad_click", slot: "home-hero", campaign: slide.sponsor!.id })}
                  className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-brand transition-transform hover:-translate-y-0.5"
                >
                  {slide.cta}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : (
                <Link href={slide.href} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5">
                  {slide.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls sit outside the animated block, so they stay put while slides change. */}
          {carousel ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
              {indicators}
              <SlideControls className="flex flex-row-reverse gap-3 md:hidden" {...controls} />
            </div>
          ) : null}
        </div>
      </div>
      {carousel ? <SlideControls className="absolute top-1/2 right-8 z-10 hidden -translate-y-[70%] flex-col items-end gap-3 md:flex lg:right-12" {...controls} /> : null}
    </section>
  );
}
