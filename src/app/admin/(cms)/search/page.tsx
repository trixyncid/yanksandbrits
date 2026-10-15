import { ArrowUpRight, BookUser, FileText, GraduationCap, HeartHandshake, Megaphone, SearchX, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { searchCms } from "@/lib/cms/search";

export const metadata: Metadata = { title: "Search" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const icons: Record<string, LucideIcon> = { Articles: FileText, Programs: GraduationCap, Tutors: BookUser, Counsellors: HeartHandshake, Ads: Megaphone };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const groups = await searchCms(query);
  const total = groups.reduce((sum, group) => sum + group.hits.length, 0);

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Search"
        title={query ? `“${query}”` : "Search"}
        description={query.length < 2 ? "Type at least two characters in the search box above." : `${total} result${total === 1 ? "" : "s"} across articles, programs, people, and ads.`}
      />
      {query.length >= 2 && total === 0 ? (
        <div className="grid place-items-center rounded-[2rem] bg-white px-6 py-16 text-center">
          <SearchX className="size-10 text-cms-gray" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold">Nothing matches “{query}”</p>
          <p className="mt-1 text-sm text-cms-ink/60">Try a shorter word, a slug, or a country.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const Icon = icons[group.label] ?? FileText;
            return (
              <section key={group.label} className="rounded-[2rem] bg-white p-5 sm:p-6" aria-labelledby={`group-${group.label}`}>
                <h2 id={`group-${group.label}`} className="flex items-center gap-3 text-lg font-semibold">
                  <span className="grid size-10 place-items-center rounded-full bg-cms-field">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  {group.label}
                  <span className="ml-auto rounded-full bg-cms-blue-10 px-2.5 py-0.5 text-xs font-bold text-cms-blue">{group.hits.length}</span>
                </h2>
                <ul className="mt-3 grid gap-1">
                  {group.hits.map((hit) => (
                    <li key={hit.id}>
                      <Link href={hit.href} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-cms-field">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold group-hover:text-cms-blue">{hit.title}</span>
                          <span className="block truncate text-xs text-cms-ink/55 capitalize">{hit.detail}</span>
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-cms-ink/40 group-hover:text-cms-blue" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
