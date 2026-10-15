import { z } from "zod";
import { normalizeWhatsapp } from "./phone";

const attribution = z.object({
  utmSource: z.string().max(120).optional().default(""),
  utmMedium: z.string().max(120).optional().default(""),
  utmCampaign: z.string().max(120).optional().default(""),
  utmTerm: z.string().max(120).optional().default(""),
  utmContent: z.string().max(120).optional().default(""),
  firstUtmSource: z.string().max(120).optional().default(""),
  firstUtmMedium: z.string().max(120).optional().default(""),
  firstUtmCampaign: z.string().max(120).optional().default(""),
  referrer: z.string().max(300).optional().default(""),
  landingPage: z.string().max(300).optional().default(""),
  device: z.enum(["mobile", "desktop"]).optional().default("desktop"),
});

export const leadSchema = z.object({
  locale: z.enum(["id", "en"]),
  // Which form the visitor used: the Contact page, or the popup before WhatsApp.
  origin: z.enum(["contact", "whatsapp"]).optional().default("contact"),
  name: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().refine((value) => normalizeWhatsapp(value) !== null),
  // Program slugs come from the CMS, so the shape is checked rather than a fixed list.
  programs: z.array(z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).min(1).max(12),
  consent: z.boolean().refine((value) => value),
  website: z.string().max(0),
  attribution: attribution.optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
