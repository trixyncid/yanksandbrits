import { ArrowLeft, BookHeart, FileText, GraduationCap, House, Megaphone, MessageSquareQuote, ShieldCheck, Ticket, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

/** A label pinned to a block of the miniature site: the CMS section that manages it. */
function Tag({ icon: Icon, label, side, delay, className }: { icon: LucideIcon; label: string; side: "left" | "right"; delay: number; className?: string }) {
  return (
    <span
      className={`absolute z-10 flex items-center gap-1.5 rounded-full bg-white py-1 pr-3 pl-1 text-[0.72rem] font-semibold whitespace-nowrap text-cms-ink shadow-[0_10px_24px_rgb(8_13_36/0.35)] motion-safe:animate-[cms-tag-in_600ms_cubic-bezier(0.22,1,0.36,1)_both] ${side === "left" ? "-left-6 xl:-left-10" : "-right-6 xl:-right-10"} ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="grid size-6 place-items-center rounded-full bg-cms-blue text-white">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      {label}
    </span>
  );
}

/** Abstract text lines for the miniature. */
const Line = ({ className }: { className: string }) => <span className={`block h-1.5 rounded-full ${className}`} />;

/** A miniature of the public site, each block labelled with the CMS section behind it. Decorative. */
function SiteMap() {
  return (
    <div className="relative mx-auto w-full max-w-[25rem]" aria-hidden="true">
      <div className="overflow-hidden rounded-[1.4rem] bg-white/[0.06] ring-1 ring-white/12 backdrop-blur-sm">
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3.5 py-2.5">
          <span className="size-2 rounded-full bg-white/25" />
          <span className="size-2 rounded-full bg-white/25" />
          <span className="size-2 rounded-full bg-white/25" />
          <span className="ml-3 h-4 flex-1 rounded-full bg-white/10" />
        </div>
        <div className="grid gap-2.5 p-3">
          {/* Hero */}
          <div className="relative rounded-xl bg-[linear-gradient(120deg,#2a2d34,#253ca1)] p-3.5">
            <Line className="w-3/4 bg-white/85" />
            <Line className="mt-1.5 w-1/2 bg-white/85" />
            <Line className="mt-3 w-2/3 bg-white/35" />
            <span className="mt-3 block h-3.5 w-16 rounded-full bg-cms-blue-60" />
            <Tag icon={House} label="Homepage" side="right" delay={150} className="top-3" />
            <Tag icon={Megaphone} label="Ads" side="left" delay={900} className="bottom-2" />
          </div>
          {/* Programs */}
          <div className="relative grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className="grid h-12 content-end rounded-lg bg-white/10 p-1.5">
                <Line className="w-3/4 bg-white/40" />
              </span>
            ))}
            <Tag icon={GraduationCap} label="Programs" side="left" delay={300} className="top-1/2 -translate-y-1/2" />
          </div>
          {/* Testimonial and story */}
          <div className="relative grid grid-cols-[1fr_1.4fr] gap-1.5">
            <span className="h-14 rounded-lg bg-white/15" />
            <span className="grid content-center gap-1.5 rounded-lg bg-white/[0.08] p-2.5">
              <Line className="w-full bg-white/40" />
              <Line className="w-4/5 bg-white/40" />
              <Line className="w-1/3 bg-white/25" />
            </span>
            <Tag icon={MessageSquareQuote} label="Testimonials" side="right" delay={450} className="top-1/2 -translate-y-1/2" />
          </div>
          {/* Articles and expos */}
          <div className="relative grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((index) => (
              <span key={index} className="rounded-lg bg-white/[0.08] p-1.5">
                <span className="block h-7 rounded-md bg-white/15" />
                <Line className="mt-1.5 w-4/5 bg-white/35" />
              </span>
            ))}
            <Tag icon={FileText} label="Articles" side="left" delay={600} className="-top-2" />
            <Tag icon={Ticket} label="Expos" side="right" delay={750} className="-bottom-3" />
          </div>
        </div>
      </div>
      <Tag icon={BookHeart} label="Student stories" side="right" delay={1050} className="-top-4 right-10! xl:right-8!" />
    </div>
  );
}

/** Who built and supports the CMS. */
function TrixyncCredit({ className, logoClassName }: { className?: string; logoClassName?: string }) {
  return (
    <span className={`flex items-center gap-2 text-xs ${className ?? ""}`}>
      Built and supported by
      <Image src="/trixync-logo.svg" alt="Trixync" width={117} height={10} className={`h-2.5 w-auto ${logoClassName ?? ""}`} />
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-cms-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      {/* Brand panel: what this tool is for, shown rather than told. */}
      <section className="relative hidden overflow-hidden bg-cms-navy text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-32 -right-24 size-[34rem] rounded-full bg-cms-blue opacity-60 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-cms-blue-60 opacity-20 blur-[100px]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.07)_1px,transparent_1.2px)] bg-[size:22px_22px]" aria-hidden="true" />

        <div className="relative flex flex-1 flex-col justify-between gap-10 p-10 xl:p-14">
          <div className="flex items-center gap-5">
            <Image src="/yb-logo.svg" alt="Yanks and Brits" width={160} height={48} className="h-12 w-auto brightness-0 invert" priority />
            <span className="h-10 w-px bg-white/20" aria-hidden="true" />
            <span className="grid gap-1.5">
              <span className="text-sm font-semibold tracking-tight">Content management system</span>
              <TrixyncCredit className="text-cms-gray-50" logoClassName="brightness-0 invert opacity-80" />
            </span>
          </div>

          <SiteMap />

          <div className="max-w-md">
            {/* Not the page heading: this panel is hidden on small screens, so "Welcome back" is the h1. */}
            <p className="text-[clamp(2.3rem,1.5rem+1.9vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.045em]">Every word on the site starts here.</p>
            <p className="mt-4 text-base leading-7 text-cms-gray-50">The homepage, programs, stories, expos, and ads: one place to write, schedule, and publish everything students and parents see.</p>
          </div>
        </div>
      </section>

      {/* Sign-in */}
      <section className="relative flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <span className="grid h-11 w-14 place-items-center rounded-xl bg-white shadow-[0_1px_2px_rgb(13_21_56/0.06)] ring-1 ring-cms-gray-25 lg:invisible">
            <Image src="/yb-logo.svg" alt="" width={44} height={33} className="h-8 w-auto" />
          </span>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-cms-ink/60 transition-colors hover:bg-white hover:text-cms-ink">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[24rem]">
            <p className="text-sm font-semibold tracking-[0.16em] text-cms-blue uppercase">Content studio</p>
            <h1 className="mt-3 text-[2.4rem] leading-[1.05] font-bold tracking-[-0.04em]">Welcome back</h1>
            <p className="mt-3 mb-8 text-[0.95rem] leading-6 text-cms-ink/60">Sign in to manage the website.</p>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_1px_2px_rgb(13_21_56/0.04),0_24px_48px_-24px_rgb(13_21_56/0.18)] sm:p-7">{children}</div>
            <p className="mt-6 text-center text-sm leading-6 text-cms-ink/55">
              Need access or forgot your password?
              <br />
              Ask an admin: accounts are created in the CMS, not by sign-up.
            </p>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-cms-ink/45">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Signed-in pages are private and hidden from search engines.
        </p>
        {/* The brand panel carries the credit on large screens. */}
        <TrixyncCredit className="mt-3 justify-center text-cms-ink/45 lg:hidden" logoClassName="opacity-60" />
      </section>
    </main>
  );
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Shell>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-cms-field" />}>
        <LoginGate searchParams={searchParams} />
      </Suspense>
    </Shell>
  );
}

async function LoginGate({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  // Only same-site admin paths are allowed as a return target.
  const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  if (user) redirect(target);
  return <LoginForm next={target} />;
}
