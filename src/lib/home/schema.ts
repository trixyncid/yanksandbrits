import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";

/** Shared by the Homepage editor (limits and types) and the server (validation). */

const text = (max: number, label = "This field") => z.string().trim().min(1, `${label} is required`).max(max);
const optional = (max: number) => z.string().trim().max(max);
const image = z
  .string()
  .trim()
  .refine((value) => value === "" || isSiteImage(value), "Upload the image or pick it from the library");
const lines = (maxItems: number, maxLength: number) => z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);

const card = z.object({ title: text(60, "Title"), body: text(220, "Text") });
const preview = z.object({ title: text(80, "Title"), body: text(320, "Text"), link: text(40, "Link text"), image });

export const homeContentSchema = z.object({
  hero: z.object({
    title: text(120, "Headline"),
    // Words in the headline that get the hand-drawn underline. Must appear in the headline.
    highlight: optional(60),
    body: text(320, "Text"),
    cta: text(40, "Button text"),
    image: image.refine(Boolean, "Pick a banner photo"),
    imageAlt: optional(160),
  }),
  features: z.object({
    programs: card,
    counsellors: card,
    studyAbroad: card,
    more: text(30, "Link text"),
  }),
  programs: z.object({ eyebrow: text(40, "Label"), title: text(120, "Title"), body: text(320, "Text"), see: text(40, "Link text") }),
  why: z.object({
    eyebrow: text(40, "Label"),
    title: text(120, "Title"),
    body: text(400, "Text"),
    highlights: lines(4, 40),
    cta: text(40, "Button text"),
    imageMain: image,
    imageInset: image,
    // Optional badge on the photo, e.g. "11+" and "Years in Medan". Both or neither.
    badgeValue: optional(12),
    badgeLabel: optional(40),
  }),
  figures: z.object({
    items: z.array(z.object({ value: text(12, "Number"), label: text(60, "Label") })).max(4),
    note: optional(240),
  }),
  journey: z.object({
    eyebrow: text(40, "Label"),
    title: text(120, "Title"),
    body: text(400, "Text"),
    cta: text(40, "Button text"),
    columns: z
      .array(
        z.object({
          title: text(60, "Column title"),
          groups: z.array(z.object({ heading: text(60, "Heading"), items: lines(6, 120) })).max(4),
        }),
      )
      .length(2),
  }),
  testimonials: z.object({ eyebrow: text(40, "Label"), title: text(120, "Title") }),
  previews: z.object({ tutors: preview, expo: preview }),
  articles: z.object({ eyebrow: text(40, "Label"), title: text(120, "Title"), more: text(30, "Link text"), viewAll: text(40, "Button text") }),
});

export type HomeContent = z.output<typeof homeContentSchema>;
