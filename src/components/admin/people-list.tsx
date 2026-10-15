import { UserRound } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/cms/format";
import { cn } from "@/lib/utils";
import { panel } from "./page-header";
import { RowActions } from "./row-actions";

export type PersonRow = {
  id: string;
  slug: string;
  name: string;
  photo: string | null;
  published: boolean;
  updatedAt: Date;
  role: string;
  /** The kind-specific flag: "Featured" for tutors, "On desk" or "Away" for counsellors. */
  badge?: string | null;
};

export const head = "px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-cms-ink/50 first:pl-6 last:pr-6";
export const cell = "px-4 py-3.5 align-middle first:pl-6 last:pr-6";

export function Pill({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", on ? "bg-cms-blue-10 text-cms-blue" : "bg-cms-gray-25 text-cms-ink/65")}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function PeopleList({
  kind,
  rows,
  badgeLabel,
  badgeOn,
  canDelete,
  empty,
}: {
  kind: "counsellor" | "tutor";
  rows: PersonRow[];
  /** Header for the kind-specific column. */
  badgeLabel: string;
  /** Which badge value reads as the "on" state. */
  badgeOn: string;
  canDelete: boolean;
  empty: React.ReactNode;
}) {
  const base = kind === "counsellor" ? "/admin/counsellors" : "/admin/tutors";
  // Tutors have their own pages; counsellors all share the Counselling page.
  const siteHref = (row: PersonRow) => (!row.published ? null : kind === "tutor" ? `/tutors/${row.slug}` : "/counselling");

  if (rows.length === 0) {
    return (
      <section className={panel}>
        <div className="px-6 py-16 text-center">{empty}</div>
      </section>
    );
  }

  return (
    <section className={panel}>
      <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-2">
        <p className="text-sm text-cms-ink/60">
          <span className="font-semibold text-cms-ink tabular-nums">{rows.length}</span> {kind}
          {rows.length === 1 ? "" : "s"} · <span className="tabular-nums">{rows.filter((row) => row.published).length}</span> live
        </p>
      </div>
      {/* Scrolls sideways on narrow screens; the actions menu renders in a portal, so it is never clipped. */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[46rem] border-separate border-spacing-0">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
              <th scope="col" className={cn(head, "w-14")}>
                #
              </th>
              <th scope="col" className={head}>
                Name
              </th>
              <th scope="col" className={head}>
                Role
              </th>
              <th scope="col" className={head}>
                Status
              </th>
              <th scope="col" className={head}>
                {badgeLabel}
              </th>
              <th scope="col" className={head}>
                Last edited
              </th>
              <th scope="col" className={cn(head, "w-16 text-right")}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="group transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                <td className={cell}>
                  <Link href={`${base}/${row.id}`} className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cms-gray-25 text-cms-gray ring-2 ring-white">
                      {row.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail
                        <img src={row.photo} alt="" className="size-full object-cover" />
                      ) : (
                        <UserRound className="size-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="truncate text-sm font-semibold hover:text-cms-blue">{row.name}</span>
                  </Link>
                </td>
                <td className={cn(cell, "max-w-[22rem] truncate text-sm text-cms-ink/70")}>{row.role || <span className="text-cms-ink/40">No role yet</span>}</td>
                <td className={cell}>
                  <Pill on={row.published}>{row.published ? "Live" : "Hidden"}</Pill>
                </td>
                <td className={cell}>{row.badge ? <Pill on={row.badge === badgeOn}>{row.badge}</Pill> : <span className="text-sm text-cms-ink/35">—</span>}</td>
                <td className={cn(cell, "text-sm whitespace-nowrap text-cms-ink/70")}>{formatDate(row.updatedAt)}</td>
                <td className={cn(cell, "text-right")}>
                  <div className="flex justify-end">
                    <RowActions
                      kind={kind}
                      id={row.id}
                      name={row.name}
                      editHref={`${base}/${row.id}`}
                      siteHref={siteHref(row)}
                      first={index === 0}
                      last={index === rows.length - 1}
                      canDelete={canDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
