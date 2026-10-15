"use client";

import { Reveal } from "@/components/motion/reveal";
import type { Testimonial } from "@/lib/testimonials/schema";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/** Quotes from the CMS (Testimonials). The heading comes from the Homepage editor. */
export function TestimonialsShowcase({ intro, items }: { intro: { eyebrow: string; title: string; previous: string; next: string }; items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const count = items.length;
  const item = items[index] ?? items[0];
  if (!item || count === 0) return null;

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((current) => (current + delta + count) % count);
  };

  return (
    <section id="testimonials" className="relative overflow-x-clip bg-white px-4 py-14 md:px-6 md:py-16">
      <div className="pointer-events-none absolute top-8 -left-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.1),transparent_68%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute top-6 -right-12 size-56 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.2),transparent_68%)]" aria-hidden="true" />

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <p className="bg-accent-soft text-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {intro.eyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-[22ch] text-[clamp(1.75rem,1rem+1.2vw,2.5rem)] leading-[1.12] font-semibold tracking-tight">{intro.title}</h2>
      </Reveal>

      <Reveal className="relative mx-auto mt-8 max-w-4xl px-6 md:px-10" delay={0.08}>
        <div className="border-line pointer-events-none absolute top-2 right-8 hidden h-[calc(100%-1rem)] w-[92%] rounded-[1.5rem] border bg-white/40 md:block" aria-hidden="true" />
        <div className="border-line pointer-events-none absolute top-4 right-4 hidden h-[calc(100%-2rem)] w-[88%] rounded-[1.5rem] border bg-white/25 md:block" aria-hidden="true" />

        <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-[0_18px_40px_rgb(11_16_32/0.08)] md:p-5" aria-live="polite">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              initial={reduce ? false : { opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`grid items-center gap-4 md:gap-6 ${item.photo ? "md:grid-cols-[220px_1fr]" : "md:px-4 md:py-3"}`}
            >
              {item.photo ? (
                <div className="relative mx-auto h-44 w-full max-w-[220px] overflow-hidden rounded-[1.1rem] md:h-52 md:max-w-none">
                  <Image src={item.photo} alt="" fill className="object-cover" sizes="220px" />
                </div>
              ) : null}
              <div className="min-w-0">
                <Quote className="text-ink/20 size-7" aria-hidden="true" />
                <blockquote className="text-ink mt-2 text-base leading-7 md:text-lg md:leading-8">{item.quote}</blockquote>
                <p className="text-ink mt-4 text-base font-semibold tracking-tight">{item.name}</p>
                {item.role ? <p className="text-muted mt-0.5 text-sm">{item.role}</p> : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              className="border-brand text-brand absolute top-1/2 left-0 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 bg-white shadow-[0_10px_24px_rgb(11_16_32/0.1)] transition-transform hover:scale-105 md:size-11"
              aria-label={intro.previous}
              onClick={() => go(-1)}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="border-brand text-brand absolute top-1/2 right-0 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 bg-white shadow-[0_10px_24px_rgb(11_16_32/0.1)] transition-transform hover:scale-105 md:size-11"
              aria-label={intro.next}
              onClick={() => go(1)}
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label={intro.eyebrow}>
              {items.map((entry, entryIndex) => {
                const active = entryIndex === index;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${entryIndex + 1}`}
                    className={`h-2.5 rounded-full transition-all ${active ? "bg-brand w-7" : "bg-logo/50 hover:bg-logo w-2.5"}`}
                    onClick={() => {
                      setDirection(entryIndex > index ? 1 : -1);
                      setIndex(entryIndex);
                    }}
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </Reveal>
    </section>
  );
}
