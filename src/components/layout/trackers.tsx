"use client";

import { useWhatsappLead } from "@/components/forms/whatsapp-lead-dialog";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { captureTouch } from "@/lib/analytics/attribution";
import { track, writeConsent, readConsent } from "@/lib/analytics/track";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { localePath } from "@/lib/utils";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

export function WhatsappButton({
  href,
  fallbackHref,
  label,
  page,
  program = "",
  className,
  children,
}: {
  href: string | null;
  fallbackHref: string;
  label: string;
  page: string;
  program?: string;
  className: string;
  children: ReactNode;
}) {
  const openLead = useWhatsappLead();
  if (openLead) {
    // Ask for a name and number first, so the lead is kept even if the chat never starts.
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => {
          track({ name: "whatsapp_click", page, program });
          openLead({ href, page, program });
        }}
      >
        {children}
      </button>
    );
  }
  if (!href) {
    return (
      <Link href={fallbackHref} className={className} aria-label={label} onClick={() => track({ name: "whatsapp_click", page, program })}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label}
      onClick={() => track({ name: "whatsapp_click", page, program })}
    >
      {children}
    </a>
  );
}

export function ConsentBanner({ copy, locale, gaId }: { copy: Bundle["consent"]; locale: Locale; gaId: string | null }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(readConsent() === null), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!gaId || !readConsent()?.analytics) return;
    if (document.querySelector(`script[data-ga="${gaId}"]`)) return;
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    script.async = true;
    script.dataset.ga = gaId;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }, [gaId, open]);

  if (!open) return null;

  function save(allowAnalytics: boolean) {
    writeConsent(allowAnalytics);
    setOpen(false);
  }

  return (
    <div
      className="fixed right-4 bottom-[calc(var(--bar-h)+1rem)] left-4 z-[var(--z-banner)] max-w-md rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-card)] lg:bottom-4 lg:left-4"
      role="dialog"
      aria-labelledby="consent-title"
    >
      <p id="consent-title" className="font-semibold">
        {copy.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
      <Link href={localePath(locale, "/privacy")} className="mt-2 inline-flex text-sm font-semibold underline">
        {"Privacy policy"}
      </Link>
      <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" checked disabled className="size-5" />
        {copy.necessary}
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-5 accent-accent" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
        {copy.analytics}
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="min-h-11 rounded-full bg-brand px-4 font-semibold text-white" onClick={() => save(analytics)}>
          {copy.save}
        </button>
        <button type="button" className="min-h-11 rounded-full border border-line px-4 font-semibold" onClick={() => save(false)}>
          {copy.reject}
        </button>
      </div>
    </div>
  );
}

export function DesktopPrompt({ copy, locale }: { copy: Bundle["prompt"]; locale: Locale }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("soft-prompt")) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    if (!desktop.matches) return;
    const show = () => {
      if (window.sessionStorage.getItem("soft-prompt")) return;
      window.sessionStorage.setItem("soft-prompt", "1");
      setOpen(true);
    };
    const timer = window.setTimeout(show, 20000);
    const onOut = (event: MouseEvent) => {
      if (event.clientY <= 8) show();
    };
    document.addEventListener("mouseout", onOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  if (!open) return null;

  return (
    <aside className="fixed top-24 right-4 z-[var(--z-banner)] hidden w-80 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-card)] lg:block" aria-labelledby="soft-prompt-title">
      <div className="flex items-start justify-between gap-3">
        <p id="soft-prompt-title" className="font-semibold">
          {copy.title}
        </p>
        <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(false)} aria-label={copy.dismiss}>
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
      <Link
        href={`${localePath(locale, "/contact")}#form`}
        className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent"
        onClick={() => track({ name: "cta_click", location: "desktop-prompt", label: copy.cta })}
      >
        {copy.cta}
      </Link>
    </aside>
  );
}

/** Records the session's entry page, referrer, and UTM tags, so leads are credited to the visit's source. */
export function AttributionCapture() {
  useEffect(() => {
    captureTouch();
  }, []);
  return null;
}

export function ScrollDepth() {
  useEffect(() => {
    const fired = new Set<number>();
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const depth = Math.round((window.scrollY / height) * 100);
      for (const mark of [25, 50, 75, 90] as const) {
        if (depth >= mark && !fired.has(mark)) {
          fired.add(mark);
          track({ name: "scroll_depth", depth: mark });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

export function FloatingWhatsapp({ href, fallbackHref, label }: { href: string | null; fallbackHref: string; label: string }) {
  return (
    <WhatsappButton
      href={href}
      fallbackHref={fallbackHref}
      label={label}
      page="float"
      className="fixed right-4 bottom-[calc(var(--bar-h)+1rem)] z-[var(--z-float)] grid size-14 place-items-center rounded-full bg-brand text-white shadow-[var(--shadow-card)] lg:bottom-6"
    >
      <WhatsappIcon className="size-6" />
    </WhatsappButton>
  );
}
