import { GraduationCap, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { adState, listAds, todayWib, type AdState } from "@/lib/cms/ads";
import { formatDate } from "@/lib/cms/format";
import { isSlotId, sponsorSlots } from "@/lib/sponsors/slots";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ads" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const states: { value: AdState | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "paused", label: "Paused" },
  { value: "ended", label: "Ended" },
];

const badge: Record<AdState, string> = {
  live: "bg-cms-blue-10 text-cms-blue",
  scheduled: "bg-white text-cms-blue ring-1 ring-inset ring-cms-blue-20",
  paused: "bg-cms-gray-25 text-cms-ink/60",
  ended: "bg-white text-cms-ink/50 ring-1 ring-cms-gray-25",
};

export default async function AdsPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  await requireUser();
  const { state: requested } = await searchParams;
  const filter = states.some((item) => item.value === requested) ? (requested as AdState | "all") : "all";
  const today = todayWib();
  const ads = (await listAds()).map((ad) => ({ ...ad, state: adState(ad, today) }));
  const counts = Object.fromEntries(states.map((item) => [item.value, item.value === "all" ? ads.length : ads.filter((ad) => ad.state === item.value).length]));
  const visible = filter === "all" ? ads : ads.filter((ad) => ad.state === filter);

  return (
    <div className="max-w-[90rem]">
      <PageHeader
        eyebrow="Advertising"
        title="Ads"
        description="Ads run in two places: the Home hero banner and the Study abroad university directory. Paused and ended campaigns never show."
        actions={
          <Link href="/admin/ads/new" className={primaryAction}>
            <Megaphone className="size-4" aria-hidden="true" />
            New campaign
          </Link>
        }
      />

      <nav aria-label="Filter by state" className="mb-4 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-cms-field bg-white p-1">
        {states.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/admin/ads" : `/admin/ads?state=${item.value}`}
            aria-current={filter === item.value ? "page" : undefined}
            className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-cms-ink/60 transition-colors hover:text-cms-ink", filter === item.value && "bg-cms-navy text-white hover:text-white")}
          >
            {item.label} <span className="tabular-nums opacity-70">{counts[item.value]}</span>
          </Link>
        ))}
      </nav>

      <section className={cn(panel, "overflow-hidden")}>
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">{ads.length === 0 ? "No campaigns yet" : "Nothing in this state"}</p>
            <p className="mx-auto mt-1 max-w-[44ch] text-sm leading-6 text-cms-ink/60">Placements with no live campaign render nothing, so the site never shows empty ad boxes.</p>
          </div>
        ) : (
          <ul className="divide-y divide-cms-field">
            {visible.map((ad) => (
              <li key={ad.id}>
                <Link href={`/admin/ads/${ad.id}`} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-cms-field sm:px-5">
                  <span className="relative hidden h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-cms-field sm:block">
                    {ad.image || ad.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail
                      <img src={(ad.image || ad.logo)!} alt="" className={cn("size-full", ad.image ? "object-cover" : "object-contain p-1.5")} />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      {ad.kind === "university" ? <GraduationCap className="size-4 shrink-0 text-cms-blue" aria-label="University" /> : null}
                      <span className="truncate font-semibold text-cms-ink group-hover:text-cms-blue">{ad.advertiser}</span>
                      {ad.country ? <span className="hidden truncate text-xs text-cms-ink/60 sm:inline">{[ad.country, ad.city].filter(Boolean).join(", ")}</span> : null}
                    </span>
                    <span className="block truncate text-xs text-cms-ink/60">
                      {ad.slug} ·{" "}
                      {ad.slots.some(isSlotId) ? (
                        ad.slots
                          .filter(isSlotId)
                          .map((slot) => sponsorSlots[slot].label)
                          .join(", ")
                      ) : (
                        <span className="font-semibold text-danger">No placement. Open it to pick one</span>
                      )}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-right text-xs text-cms-ink/60 tabular-nums md:block">
                    {formatDate(ad.startsOn)} – {formatDate(ad.endsOn)}
                  </span>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", badge[ad.state])}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                    {ad.state}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
