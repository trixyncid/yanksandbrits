"use client";

import { Bell, CalendarClock, ChevronDown, ExternalLink, Globe, LogOut, Megaphone, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { usePopover } from "./use-popover";

export type Notification = { id: string; title: string; detail: string; at: string; href: string };

const iconButton =
  "grid size-11 place-items-center rounded-full bg-white text-cms-ink/75 shadow-[0_1px_2px_rgb(13_21_56/0.06)] ring-1 ring-cms-gray-25/80 transition-colors hover:text-cms-blue hover:ring-cms-blue/30";

const menuPanel = "absolute z-40 mt-2 overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-[0_24px_60px_rgb(20_22_28/0.18)] ring-1 ring-black/5";

function when(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  const { open, setOpen, root, button, toggle } = usePopover();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${name}`}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-white"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,#253ca1,#142159)] text-sm font-bold text-white uppercase ring-[3px] ring-white">
          {initials}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-cms-ink/60 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open ? (
        <div role="menu" className={cn(menuPanel, "right-0 w-72")}>
          <div className="flex items-center gap-3 rounded-[1.1rem] bg-cms-field px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,#253ca1,#142159)] text-sm font-bold text-white uppercase">{initials}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{name}</span>
              <span className="block truncate text-xs text-cms-ink/60">{email}</span>
            </span>
          </div>
          <p className="px-3 pt-3 pb-1.5 text-xs text-cms-ink/60">
            Signed in as <span className="font-semibold text-cms-ink capitalize">{role}</span>
          </p>
          <Link role="menuitem" href="/admin/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-cms-field">
            <UserRound className="size-4 text-cms-blue" aria-hidden="true" />
            Account and password
          </Link>
          <a role="menuitem" href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-cms-field">
            <ExternalLink className="size-4 text-cms-blue" aria-hidden="true" />
            Open the website
          </a>
          <button
            role="menuitem"
            type="button"
            disabled={leaving}
            onClick={async () => {
              setLeaving(true);
              await authClient.signOut();
              router.replace("/admin/login");
              router.refresh();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {leaving ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Notifications({ items }: { items: Notification[] }) {
  const { open, setOpen, root, button, toggle } = usePopover();
  return (
    <div ref={root} className="sm:relative">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={items.length ? `Notifications, ${items.length} coming up` : "Notifications"}
        className={cn(iconButton, "relative")}
      >
        <Bell className="size-5" aria-hidden="true" strokeWidth={1.8} />
        {items.length ? (
          <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-cms-blue text-[0.68rem] font-bold text-white ring-2 ring-cms-canvas">{items.length}</span>
        ) : null}
      </button>
      {open ? (
        <div className={cn(menuPanel, "right-0 w-[min(22rem,calc(100vw-2rem))]")}>
          <p className="px-3 pt-2 pb-2 text-sm font-bold">Next 7 days</p>
          {items.length === 0 ? (
            <p className="px-3 pb-4 text-sm leading-6 text-cms-ink/60">Nothing is scheduled to go live or end this week.</p>
          ) : (
            <ul>
              {items.map((item) => {
                const Icon = item.id.startsWith("ad-") ? Megaphone : CalendarClock;
                return (
                  <li key={item.id}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-cms-field">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-cms-blue-10 text-cms-blue">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        <span className="block text-xs text-cms-ink/60">
                          {item.detail} · {when(item.at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({
  user,
  greeting,
  notifications,
}: {
  user: { name: string; email: string; role: string };
  greeting: string;
  notifications: Notification[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/admin/search" ? (params.get("q") ?? "") : "";
  const firstName = user.name.split(" ")[0];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="min-w-0 flex-1 lg:flex-none lg:basis-64 xl:basis-80">
        <p className="truncate text-[1.35rem] leading-tight font-bold tracking-[-0.03em]">
          {greeting}, {firstName}!
        </p>
        <p className="truncate text-sm text-cms-ink/55">
          <span className="capitalize">{user.role}</span> · Content studio
        </p>
      </div>
      <form action="/admin/search" role="search" className="order-last w-full lg:order-none lg:mx-auto lg:w-auto lg:max-w-md lg:flex-1">
        <label htmlFor="cms-search" className="sr-only">
          Search the CMS
        </label>
        <div className="relative">
          <input
            key={current}
            id="cms-search"
            name="q"
            defaultValue={current}
            type="search"
            placeholder="Search articles, programs, people…"
            className="h-12 w-full rounded-2xl bg-white pr-12 pl-5 text-sm shadow-[0_1px_2px_rgb(13_21_56/0.06)] ring-1 ring-cms-gray-25/80 outline-none placeholder:text-cms-ink/45 focus:ring-3 focus:ring-cms-blue/25"
          />
          <Search className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-cms-ink/45" aria-hidden="true" />
        </div>
      </form>
      <div className="relative flex items-center gap-2.5">
        <a href="/" target="_blank" rel="noreferrer" className={cn(iconButton, "max-sm:hidden")} aria-label="Open the website in a new tab" title="Open the website">
          <Globe className="size-5" aria-hidden="true" strokeWidth={1.8} />
        </a>
        <Notifications items={notifications} />
        <span className="mx-1.5 h-8 w-px bg-cms-gray-25" aria-hidden="true" />
        <UserMenu {...user} />
      </div>
    </div>
  );
}
