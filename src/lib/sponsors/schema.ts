import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";
import { slotIds } from "./slots";

export const sponsorCopySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(60),
  body: z.string().trim().min(1, "Body is required").max(140),
  cta: z.string().trim().min(1, "Button text is required").max(24),
});

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const art = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .refine((value) => value === null || isSiteImage(value), "Upload the file or pick it from the library");

export const adInputSchema = z
  .object({
    id: z.string().min(1).nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Campaign id is required")
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens"),
    advertiser: z.string().trim().min(1, "Advertiser is required").max(80),
    kind: z.enum(["university", "brand"]),
    country: z.string().trim().max(60),
    city: z.string().trim().max(60),
    majors: z.array(z.string().trim().min(1).max(60)).max(20),
    slots: z.array(z.enum(slotIds)).min(1, "Pick at least one placement"),
    programs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(12),
    startsOn: day,
    endsOn: day,
    active: z.boolean(),
    weight: z.number().int().min(1).max(100),
    href: z.url({ protocol: /^https$/, error: "Use a full https:// link" }),
    image: art,
    logo: art,
    // English only. Older campaigns may also hold `id` (Bahasa) copy; parsing drops it.
    copy: z.object({ en: sponsorCopySchema }),
  })
  .superRefine((ad, ctx) => {
    if (ad.startsOn > ad.endsOn) ctx.addIssue({ code: "custom", path: ["endsOn"], message: "Ends before it starts" });
    // Both placements are image-led: a hero slide and a university listing.
    if (ad.slots.length && !ad.image) ctx.addIssue({ code: "custom", path: ["image"], message: "Upload a banner image" });
    if (ad.slots.includes("universities") && (ad.kind !== "university" || !ad.country)) {
      ctx.addIssue({ code: "custom", path: ["country"], message: "The Study abroad listing needs a university with a country" });
    }
  });

export type AdInput = z.input<typeof adInputSchema>;
export type AdValues = z.output<typeof adInputSchema>;
