import { ChevronLeft, ChevronRight, FilePlus2, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { controlClass } from "@/components/admin/field";
import { PageHeader, panel, primaryAction, secondaryAction } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireUser } from "@/lib/auth/session";
import { listArticles, type ArticleFilter } from "@/lib/cms/articles";
import { formatDate } from "@/lib/cms/format";
import { articleState } from "@/lib/cms/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Articles" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

type Search = { status?: string; q?: string; page?: string };

const filters: { value: ArticleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
];

function readSearch(search: Search) {
  const filter = filters.some((item) => item.value === search.status) ? (search.status as ArticleFilter) : "all";
  const page = Math.max(1, Number.parseInt(search.page ?? "1", 10) || 1);
  return { filter, page, query: (search.q ?? "").trim().slice(0, 100) };
}

function hrefWith(current: ReturnType<typeof readSearch>, patch: Partial<ReturnType<typeof readSearch>>) {
  const next = { ...current, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.filter !== "all") params.set("status", next.filter);
  if (next.query) params.set("q", next.query);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/admin/articles?${qs}` : "/admin/articles";
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser();
  const search = await searchParams;
  const state = readSearch(search);
  const { items, count, pages, now } = await listArticles(state);

  return (
    <div className="max-w-[90rem]">
      <PageHeader
        eyebrow="Content"
        title="Articles"
        description="Each language version is its own article with its own slug."
        actions={
          <Link href="/admin/articles/new" className={primaryAction}>
            <FilePlus2 className="size-4" aria-hidden="true" />
            New article
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-full border border-cms-field bg-white p-1">
          {filters.map((item) => (
            <Link
              key={item.value}
              href={hrefWith(state, { filter: item.value })}
              aria-current={state.filter === item.value ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-cms-ink/60 transition-colors hover:text-cms-ink",
                state.filter === item.value && "bg-cms-navy text-white hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/admin/articles" className="flex gap-2" role="search">
          {state.filter !== "all" ? <input type="hidden" name="status" value={state.filter} /> : null}
          <div className="relative">
            <label htmlFor="q" className="sr-only">
              Search articles
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cms-ink/60" aria-hidden="true" />
            <input id="q" name="q" type="search" defaultValue={state.query} placeholder="Title, slug, category" className={cn(controlClass, "w-full py-2 pl-9 sm:w-64")} />
          </div>
          <button type="submit" className={secondaryAction}>
            Filter
          </button>
        </form>
      </div>

      <section className={cn(panel, "overflow-hidden")}>
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">{count === 0 && !state.query && state.filter === "all" ? "No articles yet" : "No articles match these filters"}</p>
            <p className="mt-1 text-sm text-cms-ink/60">
              {state.query || state.filter !== "all" ? (
                <Link href="/admin/articles" className="font-semibold text-cms-blue hover:underline">
                  Clear filters
                </Link>
              ) : (
                "Create a draft to get started."
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-cms-field bg-cms-field text-xs font-semibold tracking-wide text-cms-ink/60 uppercase">
                <tr>
                  <th scope="col" className="w-1/2 px-5 py-3">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Author
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cms-field">
                {items.map((article) => (
                  <tr key={article.id} className="group transition-colors hover:bg-cms-field">
                    <td className="max-w-0 px-5 py-3.5">
                      <Link href={`/admin/articles/${article.id}`} className="block truncate font-semibold text-cms-ink group-hover:text-cms-blue">
                        {article.title}
                      </Link>
                      <span className="block truncate text-xs text-cms-ink/60">
                        {/* Older Bahasa articles stay in the CMS, but the English-only site never shows them. */}
                        {article.locale === "id" ? <span className="mr-1.5 rounded-full bg-cms-gray-25 px-1.5 py-px font-semibold text-cms-ink/70">Bahasa · not on site</span> : null}
                        /{article.slug}
                        {article.category ? ` · ${article.category}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge state={articleState(article, now)} />
                    </td>
                    <td className="px-3 py-3.5 text-cms-ink/60">{article.author?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right text-cms-ink/60 tabular-nums">{formatDate(article.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-cms-ink/60">
          <span>
            Page {state.page} of {pages} · {count} articles
          </span>
          <span className="flex gap-2">
            {state.page > 1 ? (
              <Link href={hrefWith(state, { page: state.page - 1 })} className={secondaryAction}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                Previous
              </Link>
            ) : null}
            {state.page < pages ? (
              <Link href={hrefWith(state, { page: state.page + 1 })} className={secondaryAction}>
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </div>
  );
}
