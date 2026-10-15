import { Suspense, type ReactNode } from "react";
import { MobileBar, Sidebar } from "@/components/admin/shell/sidebar";
import { TopBar } from "@/components/admin/shell/top-bar";
import { requireUser } from "@/lib/auth/session";
import { getShellCounts } from "@/lib/cms/overview";

// Every CMS screen is per-user and behind sign-in, so there is no shared shell to prerender.
// Session checks use Web Crypto, which Next.js counts as uncached work; allow these routes to block.
export const instant = false;

export default function CmsLayout({ children }: { children: ReactNode }) {
  return (
    // --cms-top is the height of the sticky top bar (desktop only). Editors' sticky save bars and toolbars
    // stack below it instead of sliding over it.
    <div className="min-h-dvh bg-cms-canvas [--cms-top:0px] lg:grid lg:grid-cols-[6.5rem_1fr] lg:[--cms-top:5rem]">
      <Suspense fallback={<SidebarFallback />}>
        <Chrome />
      </Suspense>

      <div className="min-w-0">
        {/* Greeting, search, and account stay in reach while the page scrolls. */}
        <div className="px-4 pt-4 sm:px-6 lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-[var(--cms-top)] lg:items-center lg:border-b lg:border-cms-gray-25/70 lg:bg-cms-canvas/85 lg:px-8 lg:py-0 lg:backdrop-blur-md lg:[&>*]:w-full">
          <Suspense fallback={<div className="h-12" />}>
            <Top />
          </Suspense>
        </div>
        <main id="content" className="min-w-0 px-4 pt-5 pb-12 sm:px-6 lg:px-8 lg:pt-7">
          {children}
        </main>
      </div>
    </div>
  );
}

async function Chrome() {
  const user = await requireUser();
  const { drafts, liveAds, unassignedLeads } = await getShellCounts();
  const props = { isAdmin: user.role === "admin", counts: { drafts, liveAds, unassignedLeads } };
  return (
    <>
      <MobileBar {...props} />
      <Sidebar {...props} />
    </>
  );
}

async function Top() {
  const user = await requireUser();
  const { notifications } = await getShellCounts();
  return <TopBar user={{ name: user.name, email: user.email, role: user.role }} greeting={greeting(new Date())} notifications={notifications} />;
}

/** Time-of-day greeting in Medan time, worked out on the server so it never flickers on hydrate. */
function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(now));
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function SidebarFallback() {
  return <div className="hidden h-dvh border-r border-cms-gray-25 bg-white lg:block" aria-hidden="true" />;
}
