import { ChevronLeft, ChevronRight, CircleAlert, Download, Inbox, Search, Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Input, Select } from "@/components/admin/field";
import { LeadsTable, type LeadRow } from "@/components/admin/leads/leads-table";
import { PageHeader, panel, secondaryAction } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime, relativeTime } from "@/lib/cms/format";
import { assignableCounsellors, leadFacets, listLeads } from "@/lib/cms/leads";
import { describeLeadFilters, facetKeys, filtersQuery, originLabels, parseLeadFilters, UNASSIGNED, type LeadFilters } from "@/lib/leads/filters";
import { getPrograms } from "@/lib/programs";
import { cn } from "@/lib/utils";
import { formatWhatsapp } from "@/lib/validation/phone";
import { gatewayStatus, type GatewayStatus } from "@/lib/whatsapp/gateway";

export const metadata: Metadata = { title: "Leads" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const rangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser();
  const filters = parseLeadFilters(await searchParams);
  const [{ rows, total, unassigned, pages }, programs, counsellors, gateway] = await Promise.all([listLeads(filters), getPrograms("en"), assignableCounsellors(), gatewayStatus()]);
  const facets = await leadFacets(filters, programs, counsellors);
  const programName = new Map(programs.map((program) => [program.slug, program.name]));
  const now = new Date();
  const columnFilters = facetKeys.some((key) => filters[key].length);
  const filtered = Boolean(filters.q || columnFilters || filters.range !== "30");
  const page = Math.min(filters.page, pages);

  const tableRows: LeadRow[] = rows.map((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: formatWhatsapp(lead.whatsapp),
    whatsapp: lead.whatsapp,
    programs: lead.programs.map((slug) => programName.get(slug) ?? slug).join(", "),
    channel: lead.channel,
    campaign: lead.utmCampaign,
    form: originLabels[lead.origin],
    received: relativeTime(lead.createdAt, now),
    receivedAt: formatDateTime(lead.createdAt),
    submissions: lead.submissions,
    counsellor: lead.counsellor,
    alert: !lead.counsellor
      ? null
      : lead.notifiedAt
        ? { state: "sent", detail: `Alerted on WhatsApp ${formatDateTime(lead.notifiedAt)}` }
        : lead.notifyError
          ? { state: "failed", detail: lead.notifyError }
          : { state: "pending", detail: "No alert recorded yet." },
  }));

  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="Growth"
        title="Leads"
        description="Consultation requests from the website. Tick leads to assign them to a counsellor, who is alerted on WhatsApp. Filter and sort any column as in Excel."
        actions={
          total > 0 ? (
            <a href={`/admin/leads/export${filtersQuery(filters, { page: 1 })}`} className={secondaryAction} download>
              <Download className="size-4" aria-hidden="true" />
              Export {total === 1 ? "1 lead" : `${total.toLocaleString("en")} leads`}
            </a>
          ) : null
        }
      />

      <GatewayNote status={gateway} />

      <form method="get" className={cn(panel, "mb-5 grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end")}>
        {/* Column filters and sort live in the URL too; keep them when searching. */}
        {facetKeys.map((key) => (filters[key].length ? <input key={key} type="hidden" name={key} value={filters[key].join(",")} /> : null))}
        {filters.sort !== "newest" ? <input type="hidden" name="sort" value={filters.sort} /> : null}
        <label className="grid gap-1.5 text-xs font-semibold text-cms-ink/60">
          Search
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cms-ink/40" aria-hidden="true" />
            <Input name="q" type="search" defaultValue={filters.q} placeholder="Name, number, or campaign" className="pl-10" />
          </span>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-cms-ink/60">
          Received
          <Select name="range" defaultValue={filters.range}>
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className={cn(secondaryAction, "flex-1 sm:flex-none")}>
            Apply
          </button>
          {filtered ? (
            <Link href="/admin/leads" className="inline-flex min-h-11 items-center rounded-2xl px-3 text-sm font-semibold text-cms-ink/60 hover:text-cms-blue">
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {total === 0 && !columnFilters ? (
        <section className={panel}>
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-cms-blue-10 text-cms-blue">
              <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold">{filtered ? "No leads match these filters" : "No leads yet"}</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">
              {filtered ? "Try a longer date range or a different search." : "Requests from the Contact page and the WhatsApp popup land here as soon as they are sent."}
            </p>
          </div>
        </section>
      ) : (
        <section className={panel}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-6 pt-5 pb-2 text-sm text-cms-ink/60">
            <p>
              <span className="font-semibold text-cms-ink tabular-nums">{total.toLocaleString("en")}</span> lead{total === 1 ? "" : "s"}
              {unassigned > 0 ? (
                <>
                  {" · "}
                  <Link href={`/admin/leads${filtersQuery(filters, { counsellor: [UNASSIGNED], page: 1 })}`} className="font-semibold text-warning hover:underline">
                    {unassigned} unassigned
                  </Link>
                </>
              ) : total > 0 ? (
                " · all assigned"
              ) : null}
            </p>
            {columnFilters ? (
              <p className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cms-blue-10 px-2.5 py-0.5 text-xs font-semibold text-cms-blue">{describeLeadFilters(filters, programs, counsellors).split(" · ").slice(1).join(" · ")}</span>
                <Link href={`/admin/leads${filtersQuery(filters, { program: [], channel: [], origin: [], counsellor: [], page: 1 })}`} className="text-xs font-semibold hover:text-cms-blue">
                  Clear column filters
                </Link>
              </p>
            ) : null}
          </div>
          {/* Keyed by the view, so a new filter or page starts with nothing ticked. */}
          <LeadsTable key={filtersQuery(filters)} rows={tableRows} filters={filters} facets={facets} counsellors={counsellors} />
          {total === 0 ? <p className="px-6 pt-2 pb-8 text-center text-sm text-cms-ink/60">No leads match these column filters.</p> : null}
          {pages > 1 ? <Pagination filters={filters} page={page} pages={pages} /> : null}
        </section>
      )}
    </div>
  );
}

function GatewayNote({ status }: { status: GatewayStatus }) {
  if (status.state === "connected") {
    return (
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-cms-blue ring-1 ring-cms-blue/15">
        <Send className="size-3.5" aria-hidden="true" />
        WhatsApp alerts are on
      </p>
    );
  }
  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-warning/25">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="leading-6 text-cms-ink/75">
        <span className="font-semibold text-cms-ink">{status.state === "not-configured" ? "WhatsApp alerts are not set up." : "WhatsApp alerts are not working."}</span>{" "}
        {status.state === "problem" ? `${status.message} ` : ""}
        You can still assign leads; you will get a link to send each alert from your own WhatsApp.
      </p>
    </div>
  );
}

function Pagination({ filters, page, pages }: { filters: LeadFilters; page: number; pages: number }) {
  const link = "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-cms-ink/70 transition-colors hover:bg-cms-field hover:text-cms-blue";
  return (
    <nav aria-label="Pages" className="flex items-center justify-between border-t border-cms-gray-25/70 px-6 py-3">
      {page > 1 ? (
        <Link href={`/admin/leads${filtersQuery(filters, { page: page - 1 })}`} className={link}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-cms-ink/55 tabular-nums">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={`/admin/leads${filtersQuery(filters, { page: page + 1 })}`} className={link}>
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
