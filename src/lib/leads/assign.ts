import "server-only";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPrograms } from "@/lib/programs";
import { GatewayError, gatewayConfigured, sendWhatsapp } from "@/lib/whatsapp/gateway";
import { z } from "zod";
import { leadAlert, manualAlertHref } from "./alert";

// Enough for a busy week in one go, small enough for one WhatsApp message and one transaction.
export const maxAssign = 200;

const idsSchema = z.array(z.string().uuid()).min(1).max(maxAssign);

export type Notice =
  | { state: "sent"; message: string }
  | { state: "failed" | "skipped"; message: string; manualHref: string | null };

export type AssignResult =
  | { ok: true; changed: number; unchanged: number; counsellor: string | null; notice: Notice | null }
  | { ok: false; message: string };

/**
 * Gives leads to a counsellor (or takes them back with `counsellorId = null`), then alerts the counsellor on
 * WhatsApp with one message listing the leads that are new to them. Leads already theirs are left alone.
 */
export async function assignLeads(user: CmsUser, rawIds: unknown, counsellorId: string | null): Promise<AssignResult> {
  const parsed = idsSchema.safeParse(rawIds);
  if (!parsed.success) return { ok: false, message: `Choose between 1 and ${maxAssign} leads.` };
  const ids = [...new Set(parsed.data)];

  const counsellor = counsellorId ? await db.counsellor.findUnique({ where: { id: counsellorId }, select: { id: true, name: true, whatsapp: true } }) : null;
  if (counsellorId && !counsellor) return { ok: false, message: "That counsellor no longer exists. Reload the page." };

  const leads = await db.lead.findMany({ where: { id: { in: ids } }, select: { id: true, counsellorId: true } });
  if (leads.length === 0) return { ok: false, message: "Those leads no longer exist. Reload the page." };
  const changing = leads.filter((lead) => lead.counsellorId !== (counsellor?.id ?? null)).map((lead) => lead.id);
  const unchanged = leads.length - changing.length;

  if (!counsellor) {
    if (changing.length) {
      await db.lead.updateMany({ where: { id: { in: changing } }, data: { counsellorId: null, assignedAt: null, assignedById: null, notifiedAt: null, notifyError: null } });
    }
    return { ok: true, changed: changing.length, unchanged, counsellor: null, notice: null };
  }

  if (changing.length === 0) return { ok: true, changed: 0, unchanged, counsellor: counsellor.name, notice: null };
  await db.lead.updateMany({
    where: { id: { in: changing } },
    data: { counsellorId: counsellor.id, assignedAt: new Date(), assignedById: user.id, notifiedAt: null, notifyError: null },
  });
  const notice = await alertCounsellor(user, counsellor, changing);
  return { ok: true, changed: changing.length, unchanged, counsellor: counsellor.name, notice };
}

/** Sends (or re-sends) the alert for leads already assigned to their counsellor, e.g. after a failed send. */
export async function resendLeadAlert(user: CmsUser, leadId: string): Promise<{ ok: true; notice: Notice } | { ok: false; message: string }> {
  if (!z.string().uuid().safeParse(leadId).success) return { ok: false, message: "This lead no longer exists." };
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true, counsellor: { select: { id: true, name: true, whatsapp: true } } } });
  if (!lead) return { ok: false, message: "This lead no longer exists." };
  if (!lead.counsellor) return { ok: false, message: "Assign a counsellor first." };
  return { ok: true, notice: await alertCounsellor(user, lead.counsellor, [lead.id]) };
}

async function alertCounsellor(user: CmsUser, counsellor: { id: string; name: string; whatsapp: string | null }, leadIds: string[]): Promise<Notice> {
  const [leads, programs] = await Promise.all([
    db.lead.findMany({ where: { id: { in: leadIds } }, orderBy: { createdAt: "asc" }, select: { name: true, whatsapp: true, programs: true, channel: true } }),
    getPrograms("en"),
  ]);
  const programName = new Map(programs.map((program) => [program.slug, program.name]));
  const text = leadAlert({
    counsellor: counsellor.name,
    leads: leads.map((lead) => ({ ...lead, programs: lead.programs.map((slug) => programName.get(slug) ?? slug) })),
    assignedBy: user.name,
  });
  const record = (data: { notifiedAt?: Date; notifyError?: string }) => db.lead.updateMany({ where: { id: { in: leadIds } }, data: { notifiedAt: null, notifyError: null, ...data } });

  if (!counsellor.whatsapp) {
    const message = `${counsellor.name} has no WhatsApp number on their counsellor profile, so they were not alerted.`;
    await record({ notifyError: message });
    return { state: "skipped", message, manualHref: null };
  }
  const manualHref = manualAlertHref(counsellor.whatsapp, text);
  if (!gatewayConfigured()) {
    const message = "WhatsApp alerts are not set up, so send this one yourself.";
    await record({ notifyError: message });
    return { state: "skipped", message, manualHref };
  }
  try {
    await sendWhatsapp(counsellor.whatsapp, text);
    await record({ notifiedAt: new Date() });
    return { state: "sent", message: `${counsellor.name} was alerted on WhatsApp.` };
  } catch (error) {
    const message = error instanceof GatewayError ? error.message : "The WhatsApp alert could not be sent.";
    console.error("[leads] Counsellor alert failed:", { counsellor: counsellor.id, leads: leadIds.length, reason: error instanceof Error ? error.message : error });
    await record({ notifyError: message });
    return { state: "failed", message, manualHref };
  }
}
