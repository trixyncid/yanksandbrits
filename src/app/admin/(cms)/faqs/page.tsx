import { MessageCircleQuestion, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { cell, head, Pill } from "@/components/admin/people-list";
import { RowActions } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { listCmsFaqs } from "@/lib/cms/faqs";
import { getPrograms } from "@/lib/programs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "FAQ" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function FaqsPage() {
  const user = await requireUser();
  const [rows, programs] = await Promise.all([listCmsFaqs(), getPrograms("en")]);
  const live = rows.filter((row) => row.published).length;
  const names = (slugs: string[]) => (slugs.length ? slugs.map((slug) => programs.find((program) => program.slug === slug)?.name ?? slug).join(", ") : "All programs");

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Content"
        title="FAQ"
        description="Questions on the FAQ page, in this order within each category. Program pages and the Contact page show the ones marked for them."
        actions={
          <Link href="/admin/faqs/new" className={primaryAction}>
            <MessageCircleQuestion className="size-4" aria-hidden="true" />
            New question
          </Link>
        }
      />

      {rows.length === 0 ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">No questions yet</p>
            <p className="mx-auto mt-1 max-w-[44ch] text-sm leading-6 text-cms-ink/60">Add the questions parents and students ask most. The FAQ page shows a short note until one is live.</p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <p className="px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <span className="font-semibold text-cms-ink tabular-nums">{rows.length}</span> question{rows.length === 1 ? "" : "s"} · <span className="tabular-nums">{live}</span> live
          </p>
          {/* Scrolls sideways on narrow screens; the actions menu renders in a portal, so it is never clipped. */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[52rem] border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
                  <th scope="col" className={cn(head, "w-14")}>
                    #
                  </th>
                  <th scope="col" className={head}>
                    Question
                  </th>
                  <th scope="col" className={head}>
                    Category
                  </th>
                  <th scope="col" className={head}>
                    Program pages
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
                {rows.map((row, index) => (
                  <tr key={row.id} className="transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                    <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                    <td className={cn(cell, "max-w-[30rem]")}>
                      <Link href={`/admin/faqs/${row.id}`} className="block truncate text-sm font-semibold hover:text-cms-blue">
                        {row.question}
                      </Link>
                      <span className="flex items-center gap-2 truncate text-xs text-cms-ink/55">
                        {row.showOnContact ? (
                          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-cms-blue">
                            <PhoneCall className="size-3" aria-hidden="true" />
                            Contact page
                          </span>
                        ) : null}
                        <span className="truncate">{row.answer}</span>
                      </span>
                    </td>
                    <td className={cn(cell, "text-sm whitespace-nowrap text-cms-ink/75")}>{row.category}</td>
                    <td className={cn(cell, "max-w-[14rem] truncate text-sm text-cms-ink/70")}>{names(row.programs)}</td>
                    <td className={cell}>
                      <Pill on={row.published}>{row.published ? "Live" : "Hidden"}</Pill>
                    </td>
                    <td className={cn(cell, "text-right")}>
                      <div className="flex justify-end">
                        <RowActions
                          kind="faq"
                          id={row.id}
                          name="this question"
                          editHref={`/admin/faqs/${row.id}`}
                          siteHref={row.published ? `/faq#${row.id}` : null}
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
