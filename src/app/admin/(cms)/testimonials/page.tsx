import { MessageSquarePlus, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { cell, head, Pill } from "@/components/admin/people-list";
import { RowActions } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/cms/format";
import { listCmsTestimonials } from "@/lib/cms/testimonials";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Testimonials" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function TestimonialsPage() {
  const user = await requireUser();
  const rows = await listCmsTestimonials();
  const live = rows.filter((row) => row.published).length;

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Content"
        title="Testimonials"
        description="Quotes on the home page, in this order. The section is hidden until at least one is live."
        actions={
          <Link href="/admin/testimonials/new" className={primaryAction}>
            <MessageSquarePlus className="size-4" aria-hidden="true" />
            New testimonial
          </Link>
        }
      />

      {rows.length === 0 ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">No testimonials yet</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">Add a quote once a student or parent has agreed in writing. The home page shows this section only when one is live.</p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <p className="px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <span className="font-semibold text-cms-ink tabular-nums">{rows.length}</span> testimonial{rows.length === 1 ? "" : "s"} · <span className="tabular-nums">{live}</span> live
          </p>
          {/* Scrolls sideways on narrow screens; the actions menu renders in a portal, so it is never clipped. */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[46rem] border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
                  <th scope="col" className={cn(head, "w-14")}>
                    #
                  </th>
                  <th scope="col" className={head}>
                    Person
                  </th>
                  <th scope="col" className={head}>
                    Quote
                  </th>
                  <th scope="col" className={head}>
                    Status
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
                  <tr key={row.id} className="transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                    <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                    <td className={cell}>
                      <Link href={`/admin/testimonials/${row.id}`} className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cms-gray-25 text-cms-gray ring-2 ring-white">
                          {row.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail
                            <img src={row.photo} alt="" className="size-full object-cover" />
                          ) : (
                            <UserRound className="size-5" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold hover:text-cms-blue">{row.name}</span>
                          {row.role ? <span className="block truncate text-xs text-cms-ink/55">{row.role}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td className={cn(cell, "max-w-[28rem] truncate text-sm text-cms-ink/70")}>“{row.quote}”</td>
                    <td className={cell}>
                      <Pill on={row.published}>{row.published ? "Live" : "Hidden"}</Pill>
                    </td>
                    <td className={cn(cell, "text-sm whitespace-nowrap text-cms-ink/70")}>{formatDate(row.updatedAt)}</td>
                    <td className={cn(cell, "text-right")}>
                      <div className="flex justify-end">
                        <RowActions
                          kind="testimonial"
                          id={row.id}
                          name={row.name}
                          editHref={`/admin/testimonials/${row.id}`}
                          siteHref={row.published ? "/#testimonials" : null}
                          first={index === 0}
                          last={index === rows.length - 1}
                          canDelete={user.role === "admin"}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
