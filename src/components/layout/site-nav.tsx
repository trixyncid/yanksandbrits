"use client";

import { track } from "@/lib/analytics/track";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, CircleHelp, GraduationCap, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export const navIcons = {
  expo: CalendarDays,
  articles: BookOpen,
  stories: Sparkles,
  faq: CircleHelp,
  program: GraduationCap,
} as const;

export type NavIcon = keyof typeof navIcons;

export type NavLink = { href: string; label: string };

export type NavModel = {
  label: string;
  programs: {
    label: string;
    href: string;
    allLabel: string;
    items: { href: string; name: string; tag: string; summary: string }[];
    help: { title: string; body: string; cta: string; href: string };
  };
  links: NavLink[];
  explore: {
    label: string;
    items: { href: string; label: string; body: string; icon: NavIcon }[];
  };
  contact: NavLink;
};

export function pathIsCurrent(pathname: string, href: string) {
  const current = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/[#?].*$/, "").replace(/\/$/, "") || "/";
  return current === target || current.startsWith(`${target}/`);
}

const ease = [0.22, 1, 0.36, 1] as const;

function ActiveSpot({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="pointer-events-none absolute inset-x-2.5 -bottom-0.5 h-1 xl:inset-x-3" aria-hidden="true">
      {active ? (
        reduce ? (
          <span className="absolute inset-0 rounded-full bg-brand group-data-[tone=dark]/header:bg-white" />
        ) : (
          <motion.span layoutId="nav-spot" className="absolute inset-0 rounded-full bg-brand group-data-[tone=dark]/header:bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
        )
      ) : null}
    </span>
  );
}

const itemClass = (active: boolean) =>
  cn(
    "relative inline-flex min-h-10 items-center gap-1 rounded-full px-2.5 text-sm whitespace-nowrap transition-colors xl:px-3",
    active
      ? "font-semibold text-ink group-data-[tone=dark]/header:text-white"
      : "font-medium text-muted hover:bg-logo-soft/70 hover:text-ink group-data-[tone=dark]/header:text-white/80 group-data-[tone=dark]/header:hover:bg-white/10 group-data-[tone=dark]/header:hover:text-white",
  );

function Dropdown({
  id,
  label,
  active,
  open,
  onOpen,
  onClose,
  panelClassName,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  open: boolean;
  onOpen: (via: "hover" | "click") => void;
  onClose: (via: "hover" | "blur" | "click") => void;
  panelClassName: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapper}
      className="relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && onOpen("hover")}
      onPointerLeave={(event) => event.pointerType === "mouse" && onClose("hover")}
      onBlur={(event) => {
        if (!wrapper.current?.contains(event.relatedTarget as Node | null)) onClose("blur");
      }}
    >
      <button
        type="button"
        className={cn(itemClass(active), open && !active && "bg-logo-soft/70 text-ink group-data-[tone=dark]/header:bg-white/10 group-data-[tone=dark]/header:text-white")}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? onClose("click") : onOpen("click"))}
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
        <ActiveSpot active={active} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            className={cn("absolute top-full z-10 pt-3", panelClassName)}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease }}
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_24px_60px_rgb(42_45_52/0.16)]">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteNav({ nav }: { nav: NavModel }) {
  const pathname = usePathname();
  const baseId = useId();
  const [open, setOpen] = useState<"programs" | "explore" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const openMenu = (menu: "programs" | "explore", via: "hover" | "click") => {
    clearTimer();
    if (via === "hover") {
      timer.current = setTimeout(() => {
        hoverOpenedAt.current = Date.now();
        setOpen(menu);
      }, 90);
      return;
    }
    setOpen(menu);
    track({ name: "cta_click", location: "nav-menu", label: menu });
  };

  const closeMenu = (via: "hover" | "blur" | "click") => {
    // A click that lands just after hover opened the menu means "open", not "toggle closed".
    if (via === "click" && Date.now() - hoverOpenedAt.current < 500) return;
    clearTimer();
    if (via === "hover") {
      timer.current = setTimeout(() => setOpen(null), 160);
      return;
    }
    setOpen(null);
  };

  // Close on route change, Escape, and clicks outside the nav.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(null);
      navRef.current?.querySelector<HTMLButtonElement>(`[aria-controls="${baseId}-${open}"]`)?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, baseId]);

  useEffect(() => clearTimer, []);

  const programsActive = pathIsCurrent(pathname, nav.programs.href);
  const exploreActive = nav.explore.items.some((item) => pathIsCurrent(pathname, item.href));

  return (
    <nav ref={navRef} className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex" aria-label={nav.label}>
      <Dropdown
        id={`${baseId}-programs`}
        label={nav.programs.label}
        active={programsActive}
        open={open === "programs"}
        onOpen={(via) => openMenu("programs", via)}
        onClose={closeMenu}
        panelClassName="left-0 w-[min(44rem,calc(100vw-2rem))] xl:left-1/2 xl:-translate-x-1/2"
      >
        <div className="grid grid-cols-[1fr_15rem]">
          <ul className="grid grid-cols-2 gap-1 p-3">
            {nav.programs.items.map((program) => {
              const active = pathIsCurrent(pathname, program.href);
              return (
                <li key={program.href}>
                  <Link
                    href={program.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("group flex h-full flex-col rounded-2xl p-4 transition-colors", active ? "bg-accent-soft" : "hover:bg-logo-soft/70")}
                  >
                    <span className="text-[0.7rem] font-semibold tracking-[0.14em] text-logo uppercase">{program.tag}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-base font-semibold tracking-tight text-ink group-hover:text-brand">
                      {program.name}
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                    </span>
                    <span className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{program.summary}</span>
                  </Link>
                </li>
              );
            })}
            <li className="col-span-2 border-t border-line px-4 pt-3 pb-1">
              <Link href={nav.programs.href} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep">
                {nav.programs.allLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
          <div className="relative flex flex-col overflow-hidden bg-brand p-6 text-white">
            <div className="pointer-events-none absolute -right-10 -bottom-12 size-40 rounded-full bg-white/10" aria-hidden="true" />
            <span className="grid size-10 place-items-center rounded-full bg-white/15">
              <WhatsappIcon className="size-4" />
            </span>
            <p className="mt-4 text-lg leading-snug font-semibold tracking-tight">{nav.programs.help.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/80">{nav.programs.help.body}</p>
            <Link
              href={nav.programs.help.href}
              className="relative mt-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
              onClick={() => track({ name: "cta_click", location: "nav-menu", label: nav.programs.help.cta })}
            >
              {nav.programs.help.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Dropdown>

      {nav.links.map((link) => {
        const active = pathIsCurrent(pathname, link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
            {link.label}
            <ActiveSpot active={active} />
          </Link>
        );
      })}

      <Dropdown
        id={`${baseId}-explore`}
        label={nav.explore.label}
        active={exploreActive}
        open={open === "explore"}
        onOpen={(via) => openMenu("explore", via)}
        onClose={closeMenu}
        panelClassName="left-1/2 w-[22rem] -translate-x-1/2"
      >
        <ul className="grid gap-1 p-2">
          {nav.explore.items.map((item) => {
            const Icon = navIcons[item.icon];
            const active = pathIsCurrent(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("group flex items-start gap-3 rounded-2xl p-3 transition-colors", active ? "bg-accent-soft" : "hover:bg-logo-soft/70")}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-brand transition-transform group-hover:scale-105">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink group-hover:text-brand">{item.label}</span>
                    <span className="mt-0.5 block text-sm leading-5 text-muted">{item.body}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Dropdown>

      <Link href={nav.contact.href} aria-current={pathIsCurrent(pathname, nav.contact.href) ? "page" : undefined} className={itemClass(pathIsCurrent(pathname, nav.contact.href))}>
        {nav.contact.label}
        <ActiveSpot active={pathIsCurrent(pathname, nav.contact.href)} />
      </Link>
    </nav>
  );
}

export function SiteNavFallback({ nav }: { nav: NavModel }) {
  const idle = "inline-flex min-h-10 items-center gap-1 rounded-full px-2.5 text-sm xl:px-3 font-medium whitespace-nowrap text-muted group-data-[tone=dark]/header:text-white/80";
  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex" aria-label={nav.label}>
      <span className={idle}>
        {nav.programs.label}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </span>
      {nav.links.map((link) => (
        <Link key={link.href} href={link.href} className={idle}>
          {link.label}
        </Link>
      ))}
      <span className={idle}>
        {nav.explore.label}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </span>
      <Link href={nav.contact.href} className={idle}>
        {nav.contact.label}
      </Link>
    </nav>
  );
}
