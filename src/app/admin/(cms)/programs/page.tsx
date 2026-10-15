import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { cell, head, Pill } from "@/components/admin/people-list";
import { RowActions } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/cms/format";
import { listCmsPrograms } from "@/lib/cms/programs";
import { defaultProgramImage } from "@/lib/programs/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Programs" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function ProgramsPage() {
  const user = await requireUser();
  // The site is English only, so the CMS manages the English catalog.
  const programs = await listCmsPrograms("en");

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Catalog"
        title="Programs"
        description="The order here is the order in the site menu, the program list, and the footer."
        actions={
          <Link href="/admin/programs/new" className={primaryAction}>
            <FilePlus2 className="size-4" aria-hidden="true" />
            New program
          </Link>
        }
      />

      {programs.length === 0 ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">No programs yet</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">
              Until the CMS has programs, the site shows the bundled copy. Run <code className="rounded bg-cms-field px-1">bun run db:seed</code> to import it here.
            </p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <p className="px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <span className="font-semibold text-cms-ink tabular-nums">{programs.length}</span> program{programs.length === 1 ? "" : "s"} ·{" "}
            <span className="tabular-nums">{programs.filter((program) => program.published).length}</span> live
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
                    Program
                  </th>
                  <th scope="col" className={head}>
                    Page address
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
                {programs.map((program, index) => (
                  <tr key={program.id} className="transition-colors hover:bg-cms-field/70 [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70">
                    <td className={cn(cell, "font-mono text-xs text-cms-gray tabular-nums")}>{String(index + 1).padStart(2, "0")}</td>
                    <td className={cell}>
                      <Link href={`/admin/programs/${program.id}`} className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small CMS thumbnail */}
                        <img src={program.image || defaultProgramImage} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold hover:text-cms-blue">{program.name}</span>
                          {program.tag ? <span className="mt-0.5 inline-block rounded-full bg-cms-gray-25 px-2 py-0.5 text-xs text-cms-ink/60">{program.tag}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td className={cn(cell, "max-w-[20rem] truncate font-mono text-xs text-cms-ink/60")}>
                      /programs/{program.slug}
                    </td>
                    <td className={cell}>
                      <Pill on={program.published}>{program.published ? "Live" : "Hidden"}</Pill>
                    </td>
                    <td className={cn(cell, "text-sm whitespace-nowrap text-cms-ink/70")}>{formatDate(program.updatedAt)}</td>
                    <td className={cn(cell, "text-right")}>
                      <div className="flex justify-end">
                        <RowActions
                          kind="program"
                          id={program.id}
                          name={program.name}
                          editHref={`/admin/programs/${program.id}`}
                          siteHref={program.published ? `/programs/${program.slug}` : null}
                          first={index === 0}
                          last={index === programs.length - 1}
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
