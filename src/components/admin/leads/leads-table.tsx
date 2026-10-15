"use client";

import { CircleAlert, Clock, MessageCircle, Send, UserCheck, UserMinus, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { assignLeadsAction } from "@/actions/cms";
import type { FacetOption } from "@/lib/cms/leads";
import type { Notice } from "@/lib/leads/assign";
import type { FacetKey, LeadFilters } from "@/lib/leads/filters";
import { cn } from "@/lib/utils";
import { head, cell } from "../people-list";
import { primaryAction, secondaryAction } from "../page-header";
import { useToast } from "../toast";
import { ColumnFilter } from "./column-filter";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  programs: string;
  channel: string;
  campaign: string | null;
  form: string;
  received: string;
  receivedAt: string;
  submissions: number;
  counsellor: { id: string; name: string } | null;
  alert: { state: "sent" | "failed" | "pending"; detail: string } | null;
};

export type AssignableCounsellor = { id: string; name: string; onDesk: boolean; hasWhatsapp: boolean; recent: number };

export function LeadsTable({
  rows,
  filters,
  facets,
  counsellors,
}: {
  rows: LeadRow[];
  filters: LeadFilters;
  facets: Record<FacetKey, FacetOption[]>;
  counsellors: AssignableCounsellor[];
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState("");
  const [notice, setNotice] = useState<(Notice & { counsellor: string }) | null>(null);
  const [pending, startTransition] = useTransition();
  // Rows change after filtering or paging; only ids still on screen count as selected.
  const chosen = rows.filter((row) => selected.has(row.id)).map((row) => row.id);
  const allOnPage = rows.length > 0 && chosen.length === rows.length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const assign = (counsellorId: string | null) =>
    startTransition(async () => {
      const result = await assignLeadsAction(chosen, counsellorId);
      if (!result.ok) {
        toast({ tone: "error", text: result.message });
        return;
      }
      setSelected(new Set());
      const count = (n: number) => `${n} lead${n === 1 ? "" : "s"}`;
      if (!result.counsellor) {
        toast({ tone: "success", title: "Unassigned", text: result.changed ? `${count(result.changed)} back in the unassigned pile.` : "Those leads had no counsellor." });
        return;
      }
      if (result.changed === 0) {
        toast({ tone: "success", title: "Nothing changed", text: `Those leads were already with ${result.counsellor}.` });
        return;
      }
      const also = result.unchanged ? ` ${count(result.unchanged)} already with them.` : "";
      if (result.notice?.state === "sent") {
        toast({ tone: "success", title: `Assigned to ${result.counsellor}`, text: `${count(result.changed)}. ${result.notice.message}${also}` });
        setNotice(null);
      } else if (result.notice) {
        toast({ tone: "error", title: `Assigned to ${result.counsellor}, not alerted`, text: result.notice.message });
        setNotice({ ...result.notice, counsellor: result.counsellor });
      }
    });

  return (
    <>
      {notice && notice.state !== "sent" ? (
        <div role="status" className="mx-6 mt-4 flex flex-col gap-3 rounded-2xl bg-warning/8 px-4 py-3 text-sm ring-1 ring-warning/20 sm:flex-row sm:items-center">
          <CircleAlert className="hidden size-4 shrink-0 text-warning sm:block" aria-hidden="true" />
          <p className="flex-1 leading-6">
            <span className="font-semibold">{notice.counsellor} was not alerted.</span> {notice.message}
          </p>
          {notice.manualHref ? (
            <a href={notice.manualHref} target="_blank" rel="noopener noreferrer" className={cn(primaryAction, "min-h-10 shrink-0")}>
              <Send className="size-4" aria-hidden="true" />
              Send alert from my WhatsApp
            </a>
          ) : null}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="grid size-9 shrink-0 place-items-center self-end rounded-lg text-cms-ink/50 hover:bg-white sm:self-auto">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Scrolls sideways on narrow screens; filter menus render in a portal, so they are never clipped. */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[62rem] border-separate border-spacing-0">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-cms-gray-25">
              <th scope="col" className={cn(head, "w-12")}>
                <input
                  type="checkbox"
                  checked={allOnPage}
                  ref={(input) => {
                    if (input) input.indeterminate = chosen.length > 0 && !allOnPage;
                  }}
                  onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map((row) => row.id)))}
                  className="size-4 accent-cms-blue"
                  aria-label="Select every lead on this page"
                />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Received" filters={filters} sorts={[{ value: "newest", label: "Newest first", descending: true }, { value: "oldest", label: "Oldest first" }]} />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Name" filters={filters} sorts={[{ value: "name", label: "Sort A to Z" }, { value: "name-desc", label: "Sort Z to A", descending: true }]} />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Programs" filters={filters} facet="program" options={facets.program} />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Counsellor" filters={filters} facet="counsellor" options={facets.counsellor} />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Channel" filters={filters} facet="channel" options={facets.channel} />
              </th>
              <th scope="col" className={head}>
                <ColumnFilter label="Form" filters={filters} facet="origin" options={facets.origin} align="end" />
              </th>
              <th scope="col" className={cn(head, "w-14 text-right")}>
                <span className="sr-only">WhatsApp</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => {
              const isSelected = selected.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  className={cn("transition-colors [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-cms-gray-25/70", isSelected ? "bg-cms-blue-10/60" : "hover:bg-cms-field/70")}
                >
                  <td className={cell}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggle(lead.id)} className="size-4 accent-cms-blue" aria-label={`Select ${lead.name}`} />
                  </td>
                  <td className={cn(cell, "whitespace-nowrap")}>
                    <span className="block text-sm font-semibold">{lead.received}</span>
                    <span className="block text-xs text-cms-ink/55">{lead.receivedAt}</span>
                  </td>
                  <td className={cn(cell, "max-w-[15rem]")}>
                    <Link href={`/admin/leads/${lead.id}`} className="block truncate text-sm font-semibold hover:text-cms-blue">
                      {lead.name}
                    </Link>
                    <span className="block text-xs text-cms-ink/55 tabular-nums">
                      {lead.phone}
                      {lead.submissions > 1 ? <span className="ml-1.5 font-semibold text-cms-blue">· sent {lead.submissions}×</span> : null}
                    </span>
                  </td>
                  <td className={cn(cell, "max-w-[14rem] truncate text-sm text-cms-ink/75")}>{lead.programs}</td>
                  <td className={cn(cell, "max-w-[13rem]")}>
                    <Assignee lead={lead} />
                  </td>
                  <td className={cn(cell, "max-w-[13rem]")}>
                    <span className="block truncate text-sm">{lead.channel}</span>
                    {lead.campaign ? <span className="block truncate text-xs text-cms-ink/55">{lead.campaign}</span> : null}
                  </td>
                  <td className={cn(cell, "text-sm whitespace-nowrap text-cms-ink/70")}>{lead.form}</td>
                  <td className={cn(cell, "text-right")}>
                    <a
                      href={`https://wa.me/${lead.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chat with ${lead.name} on WhatsApp`}
                      title="Open WhatsApp chat"
                      className="inline-grid size-9 place-items-center rounded-xl text-cms-ink/50 transition-colors hover:bg-cms-blue-10 hover:text-cms-blue"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {chosen.length > 0 ? (
        // Stays in view at the bottom of the screen while the team keeps ticking rows.
        <div className="sticky bottom-4 z-20 mx-3 mb-3 flex flex-col gap-3 rounded-[1.25rem] bg-cms-navy p-3 text-white shadow-[0_24px_60px_rgb(13_21_56/0.35)] motion-safe:animate-[cms-pop-in_140ms_ease-out] sm:flex-row sm:items-center sm:pl-5">
          <p className="text-sm font-semibold whitespace-nowrap">
            {chosen.length} selected
            <button type="button" onClick={() => setSelected(new Set())} className="ml-3 font-medium text-white/60 underline-offset-4 hover:text-white hover:underline">
              Clear
            </button>
          </p>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <label className="sr-only" htmlFor="assign-to">
              Assign to
            </label>
            <select
              id="assign-to"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="min-h-11 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-white/60 sm:min-w-[16rem] [&>option]:text-cms-ink"
            >
              <option value="">Assign to…</option>
              {counsellors.map((counsellor) => (
                <option key={counsellor.id} value={counsellor.id}>
                  {counsellor.name} · {counsellor.recent} in 30 days{counsellor.onDesk ? "" : " · away"}
                  {counsellor.hasWhatsapp ? "" : " · no WhatsApp"}
                </option>
              ))}
            </select>
            <button type="button" disabled={!target || pending} onClick={() => assign(target)} className={cn(primaryAction, "bg-white text-cms-navy shadow-none hover:bg-cms-blue-10")}>
              <UserCheck className="size-4" aria-hidden="true" />
              {pending ? "Assigning…" : "Assign and alert"}
            </button>
            <button type="button" disabled={pending} onClick={() => assign(null)} className={cn(secondaryAction, "bg-transparent text-white ring-white/25 hover:text-white hover:ring-white/60")}>
              <UserMinus className="size-4" aria-hidden="true" />
              Unassign
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Assignee({ lead }: { lead: LeadRow }) {
  if (!lead.counsellor) {
    return <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">Unassigned</span>;
  }
  const alert = lead.alert;
  const Icon = alert?.state === "sent" ? Send : alert?.state === "failed" ? CircleAlert : Clock;
  return (
    <span className="block min-w-0">
      <span className="block truncate text-sm font-semibold">{lead.counsellor.name}</span>
      {alert ? (
        <span title={alert.detail} className={cn("flex items-center gap-1 truncate text-xs", alert.state === "sent" ? "text-cms-ink/55" : alert.state === "failed" ? "text-danger" : "text-warning")}>
          <Icon className="size-3 shrink-0" aria-hidden="true" />
          {alert.state === "sent" ? "Alerted" : alert.state === "failed" ? "Alert not sent" : "Alert pending"}
        </span>
      ) : null}
    </span>
  );
}
