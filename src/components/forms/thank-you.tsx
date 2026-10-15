"use client";

import { WhatsappIcon } from "@/components/layout/social-icons";
import type { Bundle } from "@/content/types";
import { track } from "@/lib/analytics/track";
import { messageFor } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// Long enough to read the thank-you, short enough that it still feels like one step.
const REDIRECT_SECONDS = 5;
const ease = [0.22, 1, 0.36, 1] as const;

// Eight dots thrown out from the check, alternating the two logo colours.
const burst = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * 46, y: Math.sin(angle) * 46, brand: index % 2 === 0 };
});

/**
 * Shown once a request is saved. With `redirect`, it counts down and then opens WhatsApp in this tab;
 * the visitor can open it right away or stay. A timed new tab would be blocked as a popup, so this tab goes.
 */
export function ThankYou({
  copy,
  name,
  whatsappHref,
  redirect = false,
}: {
  copy: Bundle["form"];
  name: string;
  whatsappHref: string | null;
  redirect?: boolean;
}) {
  const reduce = useReducedMotion();
  const firstName = name.trim().split(/\s+/)[0];
  const counting = redirect && Boolean(whatsappHref);
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const [stayed, setStayed] = useState(false);
  const leaving = counting && !stayed && seconds === 0;

  useEffect(() => {
    if (!counting || stayed) return;
    if (seconds === 0) {
      track({ name: "cta_click", location: "lead-thanks", label: "whatsapp-auto" });
      window.location.assign(whatsappHref!);
      return;
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [counting, stayed, seconds, whatsappHref]);

  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease } };

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-white px-5 py-8 text-center sm:px-8"
      role="status"
    >
      <div className="relative mx-auto grid size-24 place-items-center" aria-hidden="true">
        {reduce
          ? null
          : burst.map((dot, index) => (
              <motion.span
                key={index}
                className={cn("absolute size-2 rounded-full", dot.brand ? "bg-brand" : "bg-logo")}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{ x: dot.x, y: dot.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
                transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              />
            ))}
        <motion.span
          className="grid size-16 place-items-center rounded-full bg-brand text-white shadow-[0_12px_28px_rgb(37_60_161/0.35)]"
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.2, ease }} />
          </svg>
        </motion.span>
      </div>

      <motion.p className="mt-5 text-2xl font-semibold tracking-tight text-ink" {...rise(0.3)}>
        {messageFor(copy.successTitle, { name: firstName })}
      </motion.p>
      <motion.p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-muted" {...rise(0.4)}>
        {copy.successBody}
      </motion.p>
      <motion.p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/15" {...rise(0.5)}>
        <Clock className="size-3.5" aria-hidden="true" />
        {copy.successPromise}
      </motion.p>

      {whatsappHref ? (
        <motion.div className="mx-auto mt-6 max-w-xs" {...rise(0.6)}>
          {counting && !stayed ? (
            <>
              <p className="text-sm font-semibold text-ink" aria-live="polite">
                {leaving ? copy.redirectingNow : messageFor(copy.redirecting, { seconds: String(seconds) })}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-logo-soft" aria-hidden="true">
                <motion.div
                  className="h-full origin-left rounded-full bg-brand"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: REDIRECT_SECONDS, ease: "linear" }}
                />
              </div>
            </>
          ) : null}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setStayed(true);
              track({ name: "cta_click", location: "lead-thanks", label: "whatsapp-now" });
            }}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-base font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            <WhatsappIcon className="size-4" />
            {copy.whatsappCta}
          </a>
          {counting && !stayed && !leaving ? (
            <button type="button" onClick={() => setStayed(true)} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
              {copy.stay}
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}

/** Adds the visitor's name to the prepared WhatsApp message, so admissions can match the chat to the lead. */
export function withName(href: string | null, line: string, name: string) {
  if (!href || !name.trim()) return href;
  try {
    const url = new URL(href);
    const text = url.searchParams.get("text") ?? "";
    url.searchParams.set("text", `${text} ${messageFor(line, { name: name.trim() })}`.trim());
    return url.toString();
  } catch {
    return href;
  }
}
