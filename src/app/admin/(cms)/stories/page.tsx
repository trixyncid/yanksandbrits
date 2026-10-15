import { BookHeart, ShieldAlert, ShieldCheck, Star, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { cell, head, Pill } from "@/components/admin/people-list";
import { RowActions } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { listCmsStories } from "@/lib/cms/stories";
import { getPrograms } from "@/lib/programs";
import { scoreGain } from "@/lib/stories/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Student stories" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function StoriesPage() {
  const user = await requireUser();
  const [rows, programs] = await Promise.all([listCmsStories(), getPrograms("en")]);
  const live = rows.filter((row) => row.published).length;
  const programName = (slug: string) => programs.find((program) => program.slug === slug)?.name ?? "";

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Content"
        title="Student stories"
        description="Results on the Student stories page, featured first, then in this order. A story can only be published once the student's written consent is recorded."
        actions={
          <Link href="/admin/stories/new" className={primaryAction}>
            <BookHeart className="size-4" aria-hidden="true" />
            New story
          </Link>
        }
      />

      {rows.length === 0 ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">No stories yet</p>
            <p className="mx-auto mt-1 max-w-[48ch] text-sm leading-6 text-cms-ink/60">Add one once a student agrees in writing to share their name, photo, scores, and destination. Until then the page explains why it is empty.</p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <p className="px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <span className="font-semibold text-cms-ink tabular-nums">{rows.length}</span> stor{rows.length === 1 ? "y" : "ies"} · <span className="tabular-nums">{live}</span> live
          </p>
          {/* Scrolls sideways on narrow screens; the actions menu renders in a portal, so it is never clipped. */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[56rem] border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
                  <th scope="col" className={cn(head, "w-14")}>
                    #
                  </th>
                  <th scope="col" className={head}>
                    Student
                  </th>
                  <th scope="col" className={head}>
                    Result
                  </th>
                  <th scope="col" className={head}>
                    Destination
                  </th>
                  <th scope="col" className={head}>
                    Consent
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
                  const gain = scoreGain(row.scoreBefore, row.scoreAfter);
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                      <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                      <td className={cell}>
                        <Link href={`/admin/stories/${row.id}`} className="flex min-w-0 items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cms-gray-25 text-cms-gray ring-2 ring-white">
                            {row.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail
                              <img src={row.photo} alt="" className="size-full object-cover" />
                            ) : (
                              <UserRound className="size-5" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 truncate text-sm font-semibold hover:text-cms-blue">
                              {row.studentName}
                              {row.featured ? <Star className="size-3.5 shrink-0 fill-cms-blue text-cms-blue" aria-label="Featured" /> : null}
                            </span>
                            <span className="block max-w-[18rem] truncate text-xs text-cms-ink/55">“{row.headline}”</span>
                          </span>
                        </Link>
                      </td>
                      <td className={cn(cell, "text-sm whitespace-nowrap")}>
                        <span className="block text-cms-ink/70">{programName(row.program) || "—"}</span>
                        {row.scoreBefore ? (
                          <span className="font-semibold tabular-nums">
                            {row.scoreBefore} → {row.scoreAfter || "…"}
                            {gain ? <span className="ml-1.5 text-xs text-cms-blue">{gain}</span> : null}
                          </span>
                        ) : null}
                      </td>
                      <td className={cn(cell, "max-w-[16rem] text-sm")}>
                        <span className="block truncate">{row.destination || "—"}</span>
                        {row.country ? <span className="block truncate text-xs text-cms-ink/55">{[row.country, row.intake].filter(Boolean).join(" · ")}</span> : null}
                      </td>
                      <td className={cn(cell, "text-sm")}>
                        {row.consent ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-cms-blue">
                            <ShieldCheck className="size-4" aria-hidden="true" />
                            Recorded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
                            <ShieldAlert className="size-4" aria-hidden="true" />
                            Missing
                          </span>
                        )}
                      </td>
                      <td className={cell}>
                        <Pill on={row.published}>{row.published ? "Live" : "Hidden"}</Pill>
                      </td>
                      <td className={cn(cell, "text-right")}>
                        <div className="flex justify-end">
                          <RowActions
                            kind="story"
                            id={row.id}
                            name={row.studentName}
                            editHref={`/admin/stories/${row.id}`}
                            siteHref={row.published ? `/success-stories/${row.slug}` : null}
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
