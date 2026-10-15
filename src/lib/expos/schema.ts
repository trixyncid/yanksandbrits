import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
const when = z.iso.datetime({ offset: true, message: "Pick a date" }).nullable();

export const expoInputSchema = z
  .object({
    id: z.string().min(1).nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens"),
    name: z.string().trim().min(1, "Name is required").max(80),
    summary: z.string().trim().min(1, "Summary is required").max(400),
    audience: z.string().trim().max(120),
    covers: z.array(z.string().trim().min(1).max(40)).max(6),
    image: optional(300).refine((value) => value === null || isSiteImage(value), "Upload the photo or pick it from the library"),
    imageAlt: optional(160),
    startsAt: when,
    endsAt: when,
    venue: z.string().trim().max(120),
    city: z.string().trim().max(60),
    registerUrl: optional(500).refine((value) => value === null || /^https:\/\/[^\s]+$/.test(value), "Use a full https:// link"),
    published: z.boolean(),
  })
  .superRefine((expo, ctx) => {
    if (expo.endsAt && !expo.startsAt) ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Set a start before an end" });
    if (expo.startsAt && expo.endsAt && expo.endsAt < expo.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Ends before it starts" });
  });

export type ExpoInput = z.input<typeof expoInputSchema>;

/** An expo as the site renders it. Dates are ISO strings; `null` start means "to be confirmed". */
export type Expo = {
  slug: string;
  name: string;
  summary: string;
  audience: string;
  covers: string[];
  image: string | null;
  imageAlt: string;
  startsAt: string | null;
  endsAt: string | null;
  venue: string;
  city: string;
  registerUrl: string | null;
};
