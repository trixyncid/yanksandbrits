"use client";

import { CircleAlert, RotateCw, Send, UserCheck, UserMinus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { assignLeadsAction, resendLeadAlertAction } from "@/actions/cms";
import { cn } from "@/lib/utils";
import { Select } from "../field";
import { primaryAction, secondaryAction } from "../page-header";
import { useToast } from "../toast";
import type { AssignableCounsellor } from "./leads-table";

export type AssignmentState = {
  leadId: string;
  counsellor: { id: string; name: string; hasWhatsapp: boolean } | null;
  assigned: string | null;
  alert: { state: "sent" | "failed" | "pending"; detail: string } | null;
  /** Opens the alert ready to send from the user's own WhatsApp, when the counsellor has a number. */
  manualHref: string | null;
};

export function LeadAssignment({ state, counsellors }: { state: AssignmentState; counsellors: AssignableCounsellor[] }) {
  const toast = useToast();
  const [target, setTarget] = useState(state.counsellor?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [manualHref, setManualHref] = useState(state.manualHref);

  const run = (work: () => Promise<{ ok: boolean; message?: string; notice?: { state: string; message: string; manualHref?: string | null } | null; counsellor?: string | null }>) =>
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        toast({ tone: "error", text: result.message ?? "Could not save." });
        return;
      }
      const notice = result.notice;
      if (!notice) toast({ tone: "success", text: result.counsellor === null ? "Unassigned. Back in the unassigned pile." : "Nothing changed." });
      else if (notice.state === "sent") toast({ tone: "success", title: "Alert sent", text: notice.message });
      else toast({ tone: "error", title: "Not alerted", text: notice.message });
      if (notice && "manualHref" in notice) setManualHref(notice.manualHref ?? null);
    });

  const changed = target !== (state.counsellor?.id ?? "");
  const AlertIcon = state.alert?.state === "sent" ? Send : CircleAlert;

  return (
    <div className="grid gap-4">
      {state.counsellor ? (
        <div>
          <p className="text-lg font-semibold">{state.counsellor.name}</p>
          {state.assigned ? <p className="text-sm text-cms-ink/55">{state.assigned}</p> : null}
          {state.alert ? (
            <p className={cn("mt-2 flex items-start gap-1.5 text-sm leading-6", state.alert.state === "sent" ? "text-cms-ink/70" : "text-danger")}>
              <AlertIcon className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
              {state.alert.detail}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="inline-flex w-fit items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">Not assigned yet</p>
      )}

      <div className="grid gap-2">
        <label htmlFor="lead-counsellor" className="text-sm font-semibold">
          {state.counsellor ? "Reassign to" : "Assign to"}
        </label>
        <Select id="lead-counsellor" value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="">Choose a counsellor</option>
          {counsellors.map((counsellor) => (
            <option key={counsellor.id} value={counsellor.id}>
              {counsellor.name} · {counsellor.recent} in 30 days{counsellor.onDesk ? "" : " · away"}
              {counsellor.hasWhatsapp ? "" : " · no WhatsApp"}
            </option>
          ))}
        </Select>
        <button type="button" disabled={!target || !changed || pending} onClick={() => run(() => assignLeadsAction([state.leadId], target))} className={primaryAction}>
          <UserCheck className="size-4" aria-hidden="true" />
          {pending ? "Saving…" : "Assign and alert"}
        </button>
      </div>

      {state.counsellor ? (
        <div className="flex flex-wrap gap-2 border-t border-cms-gray-25/70 pt-4">
          {state.alert?.state !== "sent" && state.counsellor.hasWhatsapp ? (
            <button type="button" disabled={pending} onClick={() => run(() => resendLeadAlertAction(state.leadId))} className={secondaryAction}>
              <RotateCw className="size-4" aria-hidden="true" />
              Try the alert again
            </button>
          ) : null}
          {!state.counsellor.hasWhatsapp ? (
            <Link href={`/admin/counsellors/${state.counsellor.id}`} className={secondaryAction}>
              Add their WhatsApp number
            </Link>
          ) : null}
          {state.alert?.state !== "sent" && manualHref ? (
            <a href={manualHref} target="_blank" rel="noopener noreferrer" className={secondaryAction}>
              <Send className="size-4" aria-hidden="true" />
              Send from my WhatsApp
            </a>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setTarget("");
              run(() => assignLeadsAction([state.leadId], null));
            }}
            className={cn(secondaryAction, "text-cms-ink/70")}
          >
            <UserMinus className="size-4" aria-hidden="true" />
            Unassign
          </button>
        </div>
      ) : null}
    </div>
  );
}
