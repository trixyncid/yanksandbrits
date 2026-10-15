"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { hashIp, notifyLead, recordLead } from "@/lib/leads/store";
import { leadSchema } from "@/lib/validation/lead";
import { normalizeWhatsapp } from "@/lib/validation/phone";

export type LeadActionResult = { ok: true; id: string } | { ok: false; error: "invalid" | "limited" | "unavailable" };

const emptyAttribution = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  utmContent: "",
  firstUtmSource: "",
  firstUtmMedium: "",
  firstUtmCampaign: "",
  referrer: "",
  landingPage: "",
  device: "desktop",
};

export async function submitLead(input: unknown): Promise<LeadActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  // Honeypot filled in: answer like a success so the bot learns nothing, and store nothing.
  if (parsed.data.website.length > 0) return { ok: true, id: crypto.randomUUID() };

  const whatsapp = normalizeWhatsapp(parsed.data.whatsapp);
  if (!whatsapp) return { ok: false, error: "invalid" };
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";

  try {
    const result = await recordLead(
      {
        locale: parsed.data.locale,
        origin: parsed.data.origin,
        name: parsed.data.name,
        whatsapp,
        programs: parsed.data.programs,
        attribution: { ...emptyAttribution, ...parsed.data.attribution },
      },
      hashIp(ip),
    );
    if (!result.ok) return result;
    if (result.fresh) after(() => notifyLead(result.lead));
    return { ok: true, id: result.lead.id };
  } catch (error) {
    console.error("[leads] Could not save a lead:", error instanceof Error ? error.message : error);
    return { ok: false, error: "unavailable" };
  }
}
