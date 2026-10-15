import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";
import { counsellorContentSchema, tutorContentSchema } from "@/lib/people/types";
import { normalizeWhatsapp } from "@/lib/validation/phone";
import { docNodeSchema } from "./document";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const articleInputSchema = z.object({
  id: z.string().min(1).nullable(),
  locale: z.enum(["id", "en"]),
  title: z.string().trim().min(1, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  excerpt: z.string().trim().max(300),
  content: docNodeSchema.refine((node) => node.type === "doc", "Content must be a document"),
  coverImage: optionalText(500).refine(
    (value) => value === null || /^(https?:\/\/|\/)/i.test(value),
    "Cover must be an http(s) URL or a site path",
  ),
  coverAlt: optionalText(200),
  category: z.string().trim().max(60),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  status: z.enum(["draft", "published"]),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  seoTitle: optionalText(60),
  seoDescription: optionalText(155),
  noindex: z.boolean(),
});

export type ArticleInput = z.input<typeof articleInputSchema>;

export const newUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters").max(128),
  role: z.enum(["admin", "editor"]),
});

const text = (max: number) => z.string().trim().max(max);

export const programInputSchema = z.object({
  id: z.string().min(1).nullable(),
  locale: z.enum(["id", "en"]),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
  published: z.boolean(),
  category: z.enum(["language", "academic"]),
  name: z.string().trim().min(1, "Name is required").max(60),
  tag: text(30),
  headline: text(120),
  summary: z.string().trim().min(1, "A summary is required").max(300),
  targetAudience: text(300),
  format: z.enum(["online", "offline", "hybrid"]),
  formatLabel: text(160),
  duration: text(60),
  schedule: text(80),
  level: text(160),
  outcomes: z.array(z.string().trim().min(1).max(200)).max(8),
  syllabus: z.array(z.object({ title: z.string().trim().min(1, "Each module needs a title").max(80), body: text(240) })).max(16),
  // Site paths only: the public CSP serves images from this origin.
  image: optionalText(300).refine((value) => value === null || isSiteImage(value), "Upload an image or pick one from the library"),
  imageAlt: optionalText(160),
  seoTitle: optionalText(34),
  seoDescription: optionalText(155),
});

export type ProgramInput = z.input<typeof programInputSchema>;

const personSlug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens");
const photo = optionalText(300).refine((value) => value === null || isSiteImage(value), "Upload a photo or pick one from the library");

export const counsellorInputSchema = z.object({
  id: z.string().min(1).nullable(),
  slug: personSlug,
  name: z.string().trim().min(1, "Name is required").max(80),
  photo,
  published: z.boolean(),
  onDesk: z.boolean(),
  // Private: where new-lead alerts are sent. Empty means no alerts.
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value, ctx) => {
      if (!value) return null;
      const normalized = normalizeWhatsapp(value);
      if (!normalized) ctx.addIssue({ code: "custom", message: "Use an Indonesian mobile number, such as 0812… or +62 812…" });
      return normalized;
    }),
  content: counsellorContentSchema,
});

export const tutorInputSchema = z.object({
  id: z.string().min(1).nullable(),
  slug: personSlug,
  name: z.string().trim().min(1, "Name is required").max(80),
  photo,
  published: z.boolean(),
  featured: z.boolean(),
  programs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(12),
  languages: z.array(z.string().trim().min(1).max(40)).max(8),
  content: tutorContentSchema,
});

export type CounsellorInput = z.input<typeof counsellorInputSchema>;
export type TutorInput = z.input<typeof tutorInputSchema>;

/** Flattens zod issues to one message per field, keyed by the full path (e.g. "content.en.role"). */
export function fieldErrors(issues: z.core.$ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[issue.path.join(".") || "form"] ??= issue.message;
  return errors;
}
