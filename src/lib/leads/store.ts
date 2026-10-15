import "server-only";
import { createHash } from "node:crypto";
import type { Lead } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { channelFor } from "./channel";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// A repeat from the same number inside this window updates the lead, so one family is one row for the team.
const mergeWindow = 7 * DAY;
// Distinct leads one connection may create per hour before it is refused. Families share a phone or wifi, so not 1.
const perIpPerHour = 8;

export type LeadSubmission = {
  locale: "id" | "en";
  origin: "contact" | "whatsapp";
  name: string;
  whatsapp: string;
  programs: string[];
  attribution: {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    firstUtmSource: string;
    firstUtmMedium: string;
    firstUtmCampaign: string;
    referrer: string;
    landingPage: string;
    device: string;
  };
};

/** Salted, so the stored value cannot be matched back to an address. Used only to rate-limit. */
export function hashIp(ip: string) {
  const salt = process.env.LEAD_IP_SALT?.trim() || process.env.BETTER_AUTH_SECRET?.trim() || "lead-ip";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

const blank = (value: string) => value.trim() || null;

/**
 * Saves a step-1 submission. A number seen in the last week updates that lead (programs are merged and the
 * original source keeps the credit); otherwise a new lead is created.
 */
export async function recordLead(input: LeadSubmission, ipHash: string): Promise<{ ok: true; lead: Lead; fresh: boolean } | { ok: false; error: "limited" }> {
  const now = Date.now();
  const existing = await db.lead.findFirst({
    where: { whatsapp: input.whatsapp, createdAt: { gte: new Date(now - mergeWindow) } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    // A double click or a quick retry: nothing new to record.
    if (now - existing.updatedAt.getTime() < 30_000) return { ok: true, lead: existing, fresh: false };
    const lead = await db.lead.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        locale: input.locale,
        origin: input.origin,
        programs: [...new Set([...existing.programs, ...input.programs])],
        submissions: { increment: 1 },
        ipHash,
      },
    });
    return { ok: true, lead, fresh: false };
  }

  const recent = await db.lead.count({ where: { ipHash, updatedAt: { gte: new Date(now - 60 * MINUTE) } } });
  if (recent >= perIpPerHour) return { ok: false, error: "limited" };

  const { attribution: a } = input;
  const lead = await db.lead.create({
    data: {
      locale: input.locale,
      origin: input.origin,
      name: input.name,
      whatsapp: input.whatsapp,
      programs: input.programs,
      channel: channelFor(a),
      utmSource: blank(a.utmSource),
      utmMedium: blank(a.utmMedium),
      utmCampaign: blank(a.utmCampaign),
      utmTerm: blank(a.utmTerm),
      utmContent: blank(a.utmContent),
      firstUtmSource: blank(a.firstUtmSource),
      firstUtmMedium: blank(a.firstUtmMedium),
      firstUtmCampaign: blank(a.firstUtmCampaign),
      referrer: blank(a.referrer),
      landingPage: blank(a.landingPage),
      device: blank(a.device),
      ipHash,
    },
  });
  return { ok: true, lead, fresh: true };
}

/**
 * Optional notification (LEAD_WEBHOOK_URL), e.g. to a Slack or email automation. The database is the record,
 * so a failed delivery is logged, not retried, and never shown to the visitor.
 */
export async function notifyLead(lead: Lead) {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!url) return;
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.LEAD_WEBHOOK_SECRET?.trim();
  if (secret) headers.authorization = `Bearer ${secret}`;
  const { ipHash: _ipHash, ...payload } = lead;
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await db.lead.update({ where: { id: lead.id }, data: { deliveredAt: new Date() } });
  } catch (error) {
    console.error("[leads] Webhook delivery failed:", lead.id, error instanceof Error ? error.message : error);
  }
}
