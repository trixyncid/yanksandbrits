"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  BookHeart,
  BookUser,
  FileText,
  GraduationCap,
  HeartHandshake,
  House,
  Inbox,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  MessageCircleQuestion,
  MessageSquareQuote,
  PenLine,
  UserRound,
  Users,
  X,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  /** Shorter name for the narrow desktop rail. */
  short?: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
  /** Account lives in the avatar menu on desktop, so the rail skips it. */
  drawerOnly?: boolean;
  count?: "drafts" | "liveAds" | "unassignedLeads";
};

const groups: { label: string | null; items: Item[] }[] = [
  { label: null, items: [{ href: "/admin", label: "Dashboard", short: "Home", icon: LayoutGrid, exact: true }] },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: House, exact: true },
      { href: "/admin/articles", label: "Articles", icon: FileText, count: "drafts" },
      { href: "/admin/programs", label: "Programs", icon: GraduationCap },
      { href: "/admin/testimonials", label: "Testimonials", short: "Quotes", icon: MessageSquareQuote },
      { href: "/admin/stories", label: "Student stories", short: "Stories", icon: BookHeart },
      { href: "/admin/faqs", label: "FAQ", icon: MessageCircleQuestion },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/tutors", label: "Tutors", icon: BookUser },
      { href: "/admin/counsellors", label: "Counsellors", short: "Counsel", icon: HeartHandshake },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox, count: "unassignedLeads" },
      { href: "/admin/expos", label: "Expos", icon: Ticket },
      { href: "/admin/ads", label: "Ads", icon: Megaphone, count: "liveAds" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, exact: true, adminOnly: true },
      { href: "/admin/account", label: "Account", icon: UserRound, exact: true, drawerOnly: true },
    ],
  },
];

const countTitles = { drafts: "drafts waiting", liveAds: "campaigns live now", unassignedLeads: "leads waiting for a counsellor" };

type Props = { isAdmin: boolean; counts: { drafts: number; liveAds: number; unassignedLeads: number } };

function isActive(pathname: string, { href, exact }: Item) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function useSignOut() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const signOut = async () => {
    setLeaving(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  };
  return { leaving, signOut };
}

function Logo({ className }: { className?: string }) {
  return <Image src="/yb-logo.svg" alt="" width={52} height={39} className={cn("h-9 w-auto", className)} priority />;
}

/** Desktop: a slim white rail of icons, each with a short label so nothing relies on hover. */
export function Sidebar({ isAdmin, counts }: Props) {
  const pathname = usePathname();
  const { leaving, signOut } = useSignOut();
  const visible = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => (!item.adminOnly || isAdmin) && !item.drawerOnly) }))
    .filter((group) => group.items.length);

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col items-center border-r border-cms-gray-25 bg-white py-5 lg:flex">
      <Link href="/admin" className="grid h-12 w-[4.5rem] place-items-center rounded-2xl transition-colors hover:bg-cms-field" aria-label="Content studio home">
        <Logo />
      </Link>
      <span className="mt-4 h-px w-10 bg-cms-gray-25" aria-hidden="true" />

      <nav aria-label="CMS" className="mt-4 flex w-full flex-1 flex-col items-center gap-3 overflow-y-auto px-2.5">
        {visible.map((group, index) => (
          <ul key={group.label ?? "main"} className={cn("grid w-full gap-1", index > 0 && "border-t border-cms-gray-25/70 pt-3")} aria-label={group.label ?? undefined}>
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const value = item.count ? counts[item.count] : 0;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={item.label}
                    className="group relative flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.72rem] font-semibold"
                  >
                    {/* The reference's edge marker: a blue tab against the rail's left edge. */}
                    {active ? <span className="absolute top-1/2 -left-2.5 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cms-blue" aria-hidden="true" /> : null}
                    <span
                      className={cn(
                        "relative grid size-11 place-items-center rounded-2xl transition-colors",
                        active ? "bg-cms-blue text-white shadow-[0_8px_18px_rgb(37_60_161/0.28)]" : "text-cms-ink/55 group-hover:bg-cms-blue-10 group-hover:text-cms-blue",
                      )}
                    >
                      <Icon className="size-[1.3rem]" aria-hidden="true" strokeWidth={1.8} />
                      {item.count && value > 0 ? (
                        <span
                          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-cms-navy px-1 text-[0.65rem] font-bold text-white tabular-nums ring-2 ring-white"
                          title={`${value} ${countTitles[item.count]}`}
                        >
                          {value}
                          <span className="sr-only"> {countTitles[item.count]}</span>
                        </span>
                      ) : null}
                    </span>
                    <span className={cn("max-w-full truncate px-0.5", active ? "text-cms-blue" : "text-cms-ink/60 group-hover:text-cms-ink")}>{item.short ?? item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </nav>

      <div className="mt-4 grid justify-items-center gap-3">
        <Link
          href="/admin/articles/new"
          title="Write an article"
          className="group flex flex-col items-center gap-1 text-[0.72rem] font-semibold text-cms-ink/60 hover:text-cms-ink"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-cms-navy text-white shadow-[0_8px_18px_rgb(20_33_89/0.3)] transition-colors group-hover:bg-cms-blue">
            <PenLine className="size-5" aria-hidden="true" />
          </span>
          Write
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          title="Sign out"
          aria-label={leaving ? "Signing out" : "Sign out"}
          className="grid size-11 place-items-center rounded-2xl text-cms-ink/55 transition-colors hover:bg-danger/5 hover:text-danger disabled:opacity-50"
        >
          <LogOut className="size-5" aria-hidden="true" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

/** Mobile: a white top bar with a slide-in drawer of full, labelled links. */
export function MobileBar({ isAdmin, counts }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { leaving, signOut } = useSignOut();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-cms-gray-25 bg-white px-4 py-2.5 lg:hidden">
      <Link href="/admin" className="flex items-center gap-2.5" aria-label="Content studio home">
        <Logo className="h-8" />
        <span className="text-[0.95rem] font-bold tracking-tight">Content studio</span>
      </Link>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="relative grid size-11 place-items-center rounded-2xl bg-cms-field text-cms-ink" aria-label="Open menu">
          <Menu className="size-5" aria-hidden="true" />
          {counts.drafts + counts.liveAds + counts.unassignedLeads > 0 ? <span className="absolute top-2 right-2 size-2 rounded-full bg-cms-blue ring-2 ring-cms-field" aria-hidden="true" /> : null}
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-[min(20rem,88vw)] flex-col gap-6 overflow-y-auto bg-white px-3 py-4 font-cms text-cms-ink shadow-2xl motion-safe:animate-[cms-drawer-in_240ms_cubic-bezier(0.22,1,0.36,1)]">
            <div className="flex items-center justify-between pl-1">
              <Logo />
              <Dialog.Close className="grid size-10 place-items-center rounded-2xl bg-cms-field" aria-label="Close menu">
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Dialog.Description className="sr-only">CMS sections</Dialog.Description>

            <nav aria-label="CMS" className="grid flex-1 content-start gap-4">
              {groups.map((group) => {
                const items = group.items.filter((item) => !item.adminOnly || isAdmin);
                if (!items.length) return null;
                return (
                  <div key={group.label ?? "main"}>
                    {group.label ? <p className="mb-1 px-3 text-[0.68rem] font-semibold tracking-[0.14em] text-cms-ink/45 uppercase">{group.label}</p> : null}
                    <ul className="grid gap-0.5">
                      {items.map((item) => {
                        const active = isActive(pathname, item);
                        const value = item.count ? counts[item.count] : 0;
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors",
                                active ? "bg-cms-blue text-white" : "text-cms-ink/75 hover:bg-cms-field hover:text-cms-ink",
                              )}
                            >
                              <Icon className={cn("size-[1.15rem] shrink-0", active ? "text-white" : "text-cms-ink/50")} aria-hidden="true" strokeWidth={1.8} />
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              {item.count && value > 0 ? (
                                <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums", active ? "bg-white text-cms-blue" : "bg-cms-blue-10 text-cms-blue")}>
                                  {value}
                                  <span className="sr-only"> {countTitles[item.count]}</span>
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>

            <div className="grid gap-2">
              <Link
                href="/admin/articles/new"
                onClick={close}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cms-navy text-sm font-semibold text-white transition-colors hover:bg-cms-blue"
              >
                <PenLine className="size-4" aria-hidden="true" />
                Write an article
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={leaving}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {leaving ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
