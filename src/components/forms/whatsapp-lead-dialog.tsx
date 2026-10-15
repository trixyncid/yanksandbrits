"use client";

import { LeadForm } from "@/components/forms/lead-form";
import { WhatsappIcon } from "@/components/layout/social-icons";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { track } from "@/lib/analytics/track";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";

type Request = { href: string | null; page: string; program: string };

const WhatsappLeadContext = createContext<((request: Request) => void) | null>(null);

/** Returns the opener when the popup is mounted, so WhatsApp buttons can ask for details first. */
export function useWhatsappLead() {
  return useContext(WhatsappLeadContext);
}

export function WhatsappLeadProvider({
  locale,
  form,
  popup,
  closeLabel,
  programs,
  children,
}: {
  locale: Locale;
  form: Bundle["form"];
  popup: Pick<Bundle["whatsapp"], "popupEyebrow" | "popupTitle" | "popupBody" | "popupSkip">;
  closeLabel: string;
  programs: { slug: string; name: string }[];
  children: ReactNode;
}) {
  const [request, setRequest] = useState<(Request & { key: number }) | null>(null);
  const [open, setOpen] = useState(false);
  const preset = programs.some((program) => program.slug === request?.program) ? [request?.program as string] : [];

  return (
    <WhatsappLeadContext.Provider
      value={(next) => {
        setRequest({ ...next, key: Date.now() });
        setOpen(true);
      }}
    >
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-header/55 backdrop-blur-[2px] motion-safe:data-[state=open]:animate-[hero-fade_200ms_ease]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_24px_60px_rgb(42_45_52/0.25)] motion-safe:data-[state=open]:animate-[rise-in_320ms_cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.75rem] sm:motion-safe:data-[state=open]:animate-[soft-pop_240ms_ease]">
            <div className="relative shrink-0 overflow-hidden bg-brand px-6 pt-6 pb-5 text-white">
              <div className="pointer-events-none absolute -right-8 -bottom-14 size-36 rounded-full bg-white/10" aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <WhatsappIcon className="size-3.5" />
                  {popup.popupEyebrow}
                </p>
                <Dialog.Close className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15" aria-label={closeLabel}>
                  <X className="size-5" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <Dialog.Title className="relative mt-4 text-2xl font-semibold tracking-tight">{popup.popupTitle}</Dialog.Title>
              <Dialog.Description className="relative mt-2 text-sm leading-6 text-white/85">{popup.popupBody}</Dialog.Description>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {request ? (
                <LeadForm
                  key={request.key}
                  locale={locale}
                  copy={form}
                  programs={programs}
                  whatsappHref={request.href}
                  defaultPrograms={preset}
                  bare
                  origin="whatsapp"
                  footer={
                    request.href ? (
                      <a
                        href={request.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-auto inline-flex min-h-11 items-center text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
                        onClick={() => track({ name: "cta_click", location: "whatsapp-popup", label: "skip" })}
                      >
                        {popup.popupSkip}
                      </a>
                    ) : null
                  }
                />
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </WhatsappLeadContext.Provider>
  );
}
