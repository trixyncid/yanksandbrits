"use client";

import { navIcons, pathIsCurrent, type NavModel } from "@/components/layout/site-nav";
import { WhatsappButton } from "@/components/layout/trackers";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export function MobileNav({
  label,
  closeLabel,
  logoLabel,
  nav,
  cta,
  whatsapp,
}: {
  label: string;
  closeLabel: string;
  logoLabel: string;
  nav: NavModel;
  cta: { label: string; href: string };
  whatsapp: { label: string; href: string | null };
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-logo-soft lg:hidden group-data-[tone=dark]/header:border-white/30 group-data-[tone=dark]/header:text-white group-data-[tone=dark]/header:hover:bg-white/10"
        aria-label={label}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-header/55 backdrop-blur-[2px] motion-safe:data-[state=closed]:animate-[hero-fade_200ms_ease_reverse] motion-safe:data-[state=open]:animate-[hero-fade_200ms_ease]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[var(--z-modal)] flex w-full max-w-sm flex-col bg-white shadow-[0_0_60px_rgb(42_45_52/0.25)] motion-safe:data-[state=closed]:animate-[sheet-out_220ms_ease] motion-safe:data-[state=open]:animate-[sheet-in_320ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-4">
            <Dialog.Close asChild>
              <Link href="/" className="relative flex h-9 w-[7.25rem] items-center" aria-label={logoLabel}>
                <Image src="/yb-logo.svg" alt={logoLabel} fill className="object-contain object-left" sizes="116px" />
              </Link>
            </Dialog.Close>
            <Dialog.Close className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:bg-logo-soft" aria-label={closeLabel}>
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
            <Suspense fallback={<MobileNavBody nav={nav} pathname="" />}>
              <MobileNavLinks nav={nav} />
            </Suspense>
          </div>

          <div className="grid shrink-0 gap-2 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Dialog.Close asChild>
              <Link
                href={cta.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-deep"
                onClick={() => track({ name: "cta_click", location: "mobile-nav", label: cta.label })}
              >
                {cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Dialog.Close>
            <WhatsappButton
              href={whatsapp.href}
              fallbackHref={cta.href}
              label={whatsapp.label}
              page="mobile-nav"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-6 text-base font-semibold text-ink transition-colors hover:bg-logo-soft"
            >
              <WhatsappIcon className="size-4" />
              {whatsapp.label}
            </WhatsappButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileNavLinks({ nav }: { nav: NavModel }) {
  return <MobileNavBody nav={nav} pathname={usePathname()} />;
}

function MobileNavBody({ nav, pathname }: { nav: NavModel; pathname: string }) {
  const onNavigate = (label: string) => track({ name: "cta_click", location: "mobile-nav", label });
  const rowClass = (active: boolean) =>
    cn(
      "flex min-h-13 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-lg font-semibold tracking-tight transition-colors",
      active ? "bg-accent-soft text-brand" : "text-ink hover:bg-logo-soft/70",
    );

  return (
    <nav aria-label={nav.label}>
      <p className="px-1 text-xs font-semibold tracking-[0.14em] text-logo uppercase">{nav.programs.label}</p>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {nav.programs.items.map((program) => {
          const active = pathIsCurrent(pathname, program.href);
          return (
            <li key={program.href}>
              <Dialog.Close asChild>
                <Link
                  href={program.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onNavigate(program.name)}
                  className={cn(
                    "flex h-full min-h-20 flex-col justify-between rounded-2xl border p-3.5 transition-colors",
                    active ? "border-brand bg-accent-soft" : "border-line hover:border-brand/40 hover:bg-logo-soft/50",
                  )}
                >
                  <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-logo uppercase">{program.tag}</span>
                  <span className={cn("mt-2 text-base leading-tight font-semibold", active ? "text-brand" : "text-ink")}>{program.name}</span>
                </Link>
              </Dialog.Close>
            </li>
          );
        })}
      </ul>
      <Dialog.Close asChild>
        <Link href={nav.programs.href} className="mt-2 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-brand" onClick={() => onNavigate(nav.programs.allLabel)}>
          {nav.programs.allLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Dialog.Close>

      <ul className="mt-5 grid gap-1 border-t border-line pt-5">
        {[...nav.links, nav.contact].map((link) => {
          const active = pathIsCurrent(pathname, link.href);
          return (
            <li key={link.href}>
              <Dialog.Close asChild>
                <Link href={link.href} aria-current={active ? "page" : undefined} className={rowClass(active)} onClick={() => onNavigate(link.label)}>
                  {link.label}
                  <ChevronRight className={cn("size-4", active ? "text-brand" : "text-logo")} aria-hidden="true" />
                </Link>
              </Dialog.Close>
            </li>
          );
        })}
      </ul>

      <p className="mt-7 px-1 text-xs font-semibold tracking-[0.14em] text-logo uppercase">{nav.explore.label}</p>
      <ul className="mt-2 grid gap-1">
        {nav.explore.items.map((item) => {
          const Icon = navIcons[item.icon];
          const active = pathIsCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Dialog.Close asChild>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onNavigate(item.label)}
                  className={cn("flex items-center gap-3 rounded-2xl p-2.5 transition-colors", active ? "bg-accent-soft" : "hover:bg-logo-soft/70")}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-brand">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-base font-semibold", active ? "text-brand" : "text-ink")}>{item.label}</span>
                    <span className="block truncate text-sm text-muted">{item.body}</span>
                  </span>
                </Link>
              </Dialog.Close>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
