// The WhatsApp message a counsellor gets when leads are assigned to them. Plain text: it is read on a phone,
// so each lead gets a tap-to-chat link and nothing that needs the CMS.

import { formatWhatsapp } from "@/lib/validation/phone";

export type AlertLead = { name: string; whatsapp: string; programs: string[]; channel: string };

// WhatsApp messages stay readable to about this many leads; the rest are counted.
const maxListed = 15;

export function leadAlert({ counsellor, leads, assignedBy }: { counsellor: string; leads: AlertLead[]; assignedBy: string }) {
  const first = counsellor.trim().split(/\s+/)[0];
  const listed = leads.slice(0, maxListed);
  const lines = [
    `Hi ${first}, ${leads.length === 1 ? "a new lead has" : `${leads.length} new leads have`} been assigned to you.`,
    "",
    ...listed.flatMap((lead, index) => [
      `${index + 1}. *${lead.name}*`,
      `   ${[lead.programs.join(", "), lead.channel].filter(Boolean).join(" · ")}`,
      `   ${formatWhatsapp(lead.whatsapp)} · https://wa.me/${lead.whatsapp}`,
      "",
    ]),
    ...(leads.length > listed.length ? [`…and ${leads.length - listed.length} more. See Leads in the CMS.`, ""] : []),
    `Please contact ${leads.length === 1 ? "them" : "each of them"} within one business day.`,
    `Assigned by ${assignedBy} · Yanks and Brits CMS`,
  ];
  return lines.join("\n");
}

/** A wa.me link that opens the alert ready to send, for when the gateway is not available. */
export const manualAlertHref = (counsellorWhatsapp: string, text: string) => `https://wa.me/${counsellorWhatsapp}?text=${encodeURIComponent(text)}`;
