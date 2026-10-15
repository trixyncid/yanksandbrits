import {
  BookUser,
  CalendarClock,
  CircleCheck,
  FilePen,
  FileText,
  GraduationCap,
  HeartHandshake,
  ImageOff,
  Megaphone,
  MegaphoneOff,
  PenLine,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityChart } from "@/components/admin/dashboard/activity-chart";
import { card, Delta, Panel, ReadinessCard, SideList, StatCard, TaskRow } from "@/components/admin/dashboard/cards";
import { RangePicker } from "@/components/admin/dashboard/range-picker";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireUser } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/cms/articles";
import { relativeTime } from "@/lib/cms/format";
import { getOverview, ranges, type RangeDays } from "@/lib/cms/overview";
import { articleState } from "@/lib/cms/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(date);
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireUser();
  const { range: requested } = await searchParams;
  const range = (ranges.find((days) => String(days) === requested) ?? 30) as RangeDays;
  const [overview, stats] = await Promise.all([getOverview(range), getDashboardStats()]);
  const { articles, programs, people, activity, ads, now } = overview;
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(now);

  const bucketMs = activity.bucketDays * 24 * 60 * 60 * 1000;
  const start = now.getTime() - range * 24 * 60 * 60 * 1000;
  const activityLabels = activity.columns.map((_, index) => {
    const from = new Date(start + index * bucketMs);
    const to = new Date(start + (index + 1) * bucketMs - 1);
    return activity.bucketDays === 1 ? dayLabel(from) : `${dayLabel(from)} – ${dayLabel(to)}`;
  });
  const activityTicks = activity.columns.map((_, index) => dayLabel(new Date(start + index * bucketMs)));

  // The to-do list: only what someone can act on today, biggest win first.
  const tasks = [
    { show: articles.drafts > 0, icon: FilePen, title: "Finish drafts", detail: "Not on the site yet", value: articles.drafts, href: "/admin/articles?status=draft" },
    {
      show: articles.total - articles.ready > 0,
      icon: ImageOff,
      title: "Add covers and summaries",
      detail: "Shared links look bare without them",
      value: articles.total - articles.ready,
      href: "/admin/articles",
    },
    {
      show: !programs.usingFallback && programs.total - programs.live > 0,
      icon: GraduationCap,
      title: "Unpublished programs",
      detail: "Hidden from the programs page",
      value: programs.total - programs.live,
      href: "/admin/programs",
    },
    {
      show: people.counsellors - people.onDesk > 0,
      icon: HeartHandshake,
      title: "Counsellors off desk",
      detail: "Students can't book them",
      value: people.counsellors - people.onDesk,
      href: "/admin/counsellors",
    },
  ].filter((task) => task.show);

  return (
    <div className="mx-auto max-w-[100rem]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.035em]">Overview</h1>
          <p className="mt-1 text-sm text-cms-ink/55">{today} · what students see on the site right now</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cms-blue px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgb(37_60_161/0.25)] transition-colors hover:bg-cms-blue-deep"
        >
          <PenLine className="size-4" aria-hidden="true" />
          New article
        </Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Main column */}
        <div className="grid min-w-0 content-start gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <StatCard
              icon={FileText}
              value={articles.published}
              label="Published articles"
              href="/admin/articles?status=published"
              foot={
                <>
                  <span>
                    {articles.drafts} draft{articles.drafts === 1 ? "" : "s"} · {articles.scheduled} scheduled
                  </span>
                  {articles.newInRange ? <Delta value={articles.newInRange} suffix=" new" /> : null}
                </>
              }
            />
            <StatCard
              icon={GraduationCap}
              value={programs.live}
              label="Programs live"
              href="/admin/programs"
              foot={programs.usingFallback ? "Showing built-in copy until imported" : `${programs.averageModules} modules on average`}
            />
            <StatCard
              icon={BookUser}
              value={people.tutors}
              label={people.tutors === 1 ? "Tutor on the site" : "Tutors on the site"}
              href="/admin/tutors"
              foot={`${people.onDesk} of ${people.counsellors} counsellors on desk`}
            />
            <StatCard
              icon={Megaphone}
              value={ads.live}
              label={ads.live === 1 ? "Campaign live" : "Campaigns live"}
              href="/admin/ads"
              foot={`${ads.daysThisMonth} campaign day${ads.daysThisMonth === 1 ? "" : "s"} booked this month`}
            />
          </div>

          <Panel
            id="activity-heading"
            title="Activity"
            subtitle="Saves across articles, programs, people, and ads"
            action={
              <div className="flex items-center gap-3">
                <p className="text-right">
                  <span className="block text-xl leading-none font-bold tabular-nums">{activity.total}</span>
                  <span className="text-xs text-cms-ink/55">edits</span>
                </p>
                <Delta value={activity.change} />
                <RangePicker value={range} options={ranges} />
              </div>
            }
          >
            {activity.total === 0 ? (
              <p className="mt-6 rounded-[1.25rem] bg-cms-field px-5 py-14 text-center text-sm text-cms-ink/60">No saves in the last {range} days. Edits show up here as soon as you save.</p>
            ) : (
              <ActivityChart columns={activity.columns} labels={activityLabels} ticks={activityTicks} />
            )}
          </Panel>

          <Panel
            id="recent-heading"
            title="Recently edited"
            action={
              <Link href="/admin/articles" className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-cms-blue ring-1 ring-cms-gray-25 transition-colors hover:bg-cms-blue-10 hover:ring-cms-blue/20">
                All articles
              </Link>
            }
          >
            {stats.recent.length === 0 ? (
              <p className="mt-5 rounded-[1.25rem] bg-cms-field px-5 py-10 text-center text-sm text-cms-ink/60">Edits show up here as soon as you save.</p>
            ) : (
              <div className="mt-5">
                {/* Column heads, matching the row grid below. */}
                <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_7rem] gap-4 px-4 pb-2.5 text-xs font-semibold text-cms-ink/50 md:grid" aria-hidden="true">
                  <span>Article</span>
                  <span>Author</span>
                  <span>Updated</span>
                  <span>Status</span>
                </div>
                <ul className="grid gap-1">
                  {stats.recent.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-2xl px-4 py-3 transition-[background-color,box-shadow] hover:bg-white hover:shadow-[0_8px_28px_-6px_rgb(13_21_56/0.14)] max-md:hover:bg-cms-field max-md:hover:shadow-none md:grid-cols-[minmax(0,1fr)_9rem_8rem_7rem] md:bg-cms-field/60"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cms-blue-10 text-[0.68rem] font-bold text-cms-blue uppercase">{article.locale}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold group-hover:text-cms-blue">{article.title}</span>
                            <span className="block truncate text-xs text-cms-ink/55 md:hidden">
                              {article.author?.name ?? "No author"} · {relativeTime(article.updatedAt, stats.now)}
                            </span>
                          </span>
                        </span>
                        <span className="hidden truncate text-sm text-cms-ink/70 md:block">{article.author?.name ?? "No author"}</span>
                        <span className="hidden truncate text-sm text-cms-ink/70 md:block">{relativeTime(article.updatedAt, stats.now)}</span>
                        <StatusBadge state={articleState(article, stats.now)} className="justify-self-start" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </div>

        {/* Right column: status, then things to do, then what's coming. */}
        <aside className="grid content-start gap-8 sm:grid-cols-2 xl:grid-cols-1" aria-label="Status and tasks">
          <div className="sm:col-span-2 xl:col-span-1">
            <ReadinessCard ready={articles.ready} total={articles.total} />
          </div>

          <SideList id="todo-heading" title="Needs attention" subtitle={tasks.length ? "Quick wins for the site" : undefined}>
            {tasks.length === 0 ? (
              <p className={cn(card, "mt-4 flex items-center gap-3 px-4 py-4 text-sm font-medium")}>
                <CircleCheck className="size-5 text-cms-blue" aria-hidden="true" />
                All caught up.
              </p>
            ) : (
              <ul className="mt-3 grid gap-1">
                {tasks.map((task) => (
                  <TaskRow key={task.title} icon={task.icon} title={task.title} detail={task.detail} value={task.value} href={task.href} />
                ))}
              </ul>
            )}
          </SideList>

          <SideList id="upcoming-heading" title="Coming up" subtitle="Next two weeks">
            {overview.upcoming.length === 0 ? (
              <p className="mt-4 rounded-[1.25rem] border border-dashed border-cms-gray-50 px-5 py-6 text-sm leading-6 text-cms-ink/60">
                Nothing scheduled. Give an article a future publish date, or book a campaign.
              </p>
            ) : (
              <ul className="mt-3 grid gap-1 xl:border-t xl:border-cms-gray-25 xl:pt-3">
                {overview.upcoming.map((item) => (
                  <TaskRow
                    key={`${item.kind}-${item.id}`}
                    icon={item.kind === "article" ? CalendarClock : item.kind === "ad-end" ? MegaphoneOff : Megaphone}
                    title={item.title}
                    detail={item.detail}
                    value={<span className="text-sm">{dayLabel(new Date(item.at))}</span>}
                    href={item.href}
                  />
                ))}
              </ul>
            )}
          </SideList>
        </aside>
      </div>
    </div>
  );
}
