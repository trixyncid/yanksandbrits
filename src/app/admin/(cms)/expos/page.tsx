import { CalendarPlus, Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { cell, head, Pill } from "@/components/admin/people-list";
import { RowActions } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { listCmsExpos } from "@/lib/cms/expos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Expos" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function ExposPage() {
  const user = await requireUser();
  const rows = await listCmsExpos();
  const now = new Date();
  const stateOf = (row: (typeof rows)[number]) => {
    if (!row.published) return { label: "Hidden", on: false };
    if (row.startsAt && (row.endsAt ?? row.startsAt) < now) return { label: "Ended", on: false };
    return { label: row.startsAt ? "Live" : "Live, no date", on: true };
  };
  const live = rows.filter((row) => stateOf(row).on).length;

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Growth"
        title="Expos"
        description="The lineup on the Expo page. Dated expos are listed first, soonest first, and drop off after they end. The next one also appears on the home page."
        actions={
          <Link href="/admin/expos/new" className={primaryAction}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            New expo
          </Link>
        }
      />

      {rows.length === 0 ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">No expos yet</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">Add a fair or briefing. Leave the date empty until it is confirmed; the site shows “Awaiting confirmation”.</p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <p className="px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <span className="font-semibold text-cms-ink tabular-nums">{rows.length}</span> expo{rows.length === 1 ? "" : "s"} · <span className="tabular-nums">{live}</span> on the site
          </p>
          {/* Scrolls sideways on narrow screens; the actions menu renders in a portal, so it is never clipped. */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[50rem] border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
                  <th scope="col" className={cn(head, "w-14")}>
                    #
                  </th>
                  <th scope="col" className={head}>
                    Expo
                  </th>
                  <th scope="col" className={head}>
                    Date (WIB)
                  </th>
                  <th scope="col" className={head}>
                    Venue
                  </th>
                  <th scope="col" className={head}>
                    Status
                  </th>
                  <th scope="col" className={cn(head, "w-16 text-right")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const state = stateOf(row);
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                      <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                      <td className={cell}>
                        <Link href={`/admin/expos/${row.id}`} className="flex min-w-0 items-center gap-3">
                          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-cms-blue-10 text-cms-blue">
                            {row.image ? (
                              // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail
                              <img src={row.image} alt="" className="size-full object-cover" />
                            ) : (
                              <Ticket className="size-5" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold hover:text-cms-blue">{row.name}</span>
                            {row.audience ? <span className="block truncate text-xs text-cms-ink/55">{row.audience}</span> : null}
                          </span>
                        </Link>
                      </td>
                      <td className={cn(cell, "text-sm whitespace-nowrap", row.startsAt ? "text-cms-ink/80" : "text-cms-ink/45")}>{row.startsAt ? dateFormat.format(row.startsAt) : "Not confirmed"}</td>
                      <td className={cn(cell, "max-w-[16rem] truncate text-sm text-cms-ink/70")}>{[row.venue, row.city].filter(Boolean).join(", ") || "—"}</td>
                      <td className={cell}>
                        <Pill on={state.on}>{state.label}</Pill>
                      </td>
                      <td className={cn(cell, "text-right")}>
                        <div className="flex justify-end">
                          <RowActions
                            kind="expo"
                            id={row.id}
                            name={row.name}
                            editHref={`/admin/expos/${row.id}`}
                            siteHref={state.on ? `/expo#${row.slug}` : null}
                            first={index === 0}
                            last={index === rows.length - 1}
                            canDelete={user.role === "admin"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
