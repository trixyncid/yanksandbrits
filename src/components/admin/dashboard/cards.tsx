import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The white surface every dashboard block sits on. */
export const card = "rounded-[1.75rem] bg-white shadow-[0_1px_2px_rgb(13_21_56/0.04),0_12px_32px_-12px_rgb(13_21_56/0.08)]";

export function Delta({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null || value === 0) return null;
  const up = value > 0;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", up ? "bg-cms-blue-10 text-cms-blue" : "bg-cms-gray-25 text-cms-ink/70")}>
      {up ? "+" : "−"}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

/** One headline number. The whole card is the link, so the target is as big as it looks. */
export function StatCard({ icon: Icon, value, label, foot, href }: { icon: LucideIcon; value: number; label: string; foot?: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        card,
        "group flex flex-col p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgb(13_21_56/0.04),0_18px_40px_-14px_rgb(37_60_161/0.28)] focus-visible:outline-2 focus-visible:outline-offset-2",
      )}
    >
      <span className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-cms-blue-10 text-cms-blue transition-colors group-hover:bg-cms-blue group-hover:text-white">
          <Icon className="size-[1.4rem]" aria-hidden="true" strokeWidth={1.7} />
        </span>
        <span className="grid size-8 place-items-center rounded-full text-cms-ink/35 ring-1 ring-cms-gray-25 transition-colors group-hover:text-cms-blue group-hover:ring-cms-blue/30" aria-hidden="true">
          <ArrowUpRight className="size-4" />
        </span>
      </span>
      <span className="mt-6 block text-[2.4rem] leading-none font-bold tracking-[-0.045em] tabular-nums">{value.toLocaleString("en-US")}</span>
      <span className="mt-2 block text-[0.95rem] font-medium text-cms-ink/70">{label}</span>
      {foot ? <span className="mt-3 flex flex-wrap items-center gap-2 border-t border-cms-gray-25/70 pt-3 text-xs text-cms-ink/55">{foot}</span> : null}
    </Link>
  );
}

/** A titled white block. */
export function Panel({ id, title, subtitle, action, className, children }: { id: string; title: string; subtitle?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn(card, "p-5 sm:p-6", className)} aria-labelledby={id}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="text-lg leading-tight font-bold">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-cms-ink/55">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** A list section without its own card, for the right-hand column. */
export function SideList({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-lg leading-tight font-bold">
        {title}
      </h2>
      {subtitle ? <p className="mt-1 text-sm text-cms-ink/55">{subtitle}</p> : null}
      {children}
    </section>
  );
}

/** Icon tile, title and detail, and a value on the right, like the reference's to-do rows. */
export function TaskRow({ icon: Icon, title, detail, value, href }: { icon: LucideIcon; title: string; detail: string; value: ReactNode; href: string }) {
  return (
    <li>
      <Link href={href} className="group -mx-2 flex items-center gap-3.5 rounded-2xl px-2 py-2.5 transition-colors hover:bg-white">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-cms-blue shadow-[0_1px_2px_rgb(13_21_56/0.06)] ring-1 ring-cms-gray-25/80 transition-colors group-hover:bg-cms-blue group-hover:text-white group-hover:ring-cms-blue">
          <Icon className="size-5" aria-hidden="true" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem] font-semibold">{title}</span>
          <span className="block truncate text-sm text-cms-ink/55">{detail}</span>
        </span>
        <span className="shrink-0 text-right text-[1.05rem] font-bold tabular-nums">{value}</span>
      </Link>
    </li>
  );
}

/**
 * The one dark card: how many articles are ready to share.
 * Navy with a soft glow of the logo blue; white is the only accent on it.
 */
export function ReadinessCard({ ready, total }: { ready: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((ready / total) * 100);
  const missing = total - ready;
  const status = total === 0 ? "No articles yet" : missing === 0 ? "All set" : percent >= 75 ? "Nearly there" : "In progress";
  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] bg-cms-navy p-6 text-white shadow-[0_24px_48px_-20px_rgb(20_33_89/0.6)]"
      aria-labelledby="readiness-heading"
    >
      <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-cms-blue opacity-70 blur-3xl" aria-hidden="true" />
      <div className="relative text-center">
        <h2 id="readiness-heading" className="text-[1.35rem] font-bold tracking-[-0.02em]">
          Ready to share
        </h2>
        <p className="mt-1 text-sm text-cms-gray-50">{status}</p>

        <div className="mt-6 flex items-baseline justify-center gap-1">
          <span className="text-[2.6rem] leading-none font-bold tracking-[-0.045em] tabular-nums">{percent}</span>
          <span className="text-lg text-cms-gray-50">%</span>
        </div>
        <div
          className="mt-4 h-3.5 overflow-hidden rounded-full bg-cms-navy-2 ring-1 ring-white/10"
          role="meter"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Articles ready to share"
        >
          <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }} />
        </div>

        <p className="mt-5 font-semibold">
          {total === 0 ? "Nothing to check yet" : `${ready} of ${total} article${total === 1 ? "" : "s"}`}
        </p>
        <p className="mt-1 text-sm leading-5 text-cms-gray-50">Each needs a cover image and a summary for search and social cards.</p>

        <Link
          href={total === 0 ? "/admin/articles/new" : "/admin/articles"}
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white text-[0.95rem] font-bold text-cms-navy transition-colors hover:bg-cms-blue-10"
        >
          {total === 0 ? "Write the first article" : missing === 0 ? "View articles" : `Review ${missing} article${missing === 1 ? "" : "s"}`}
        </Link>
      </div>
    </section>
  );
}
