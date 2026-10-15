import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";

const text = (max: number) => z.string().trim().max(max);

export const storyInputSchema = z
  .object({
    id: z.string().min(1).nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens"),
    studentName: z.string().trim().min(1, "Name is required").max(80),
    headline: z.string().trim().min(1, "A short quote is required").max(180),
    body: text(4000),
    program: text(60),
    scoreLabel: text(40),
    scoreBefore: text(12),
    scoreAfter: text(12),
    destination: text(120),
    country: text(60),
    intake: text(40),
    photo: z
      .string()
      .trim()
      .refine((value) => value === "" || isSiteImage(value), "Upload the photo or pick it from the library")
      .transform((value) => value || null),
    photoAlt: text(160).transform((value) => value || null),
    consent: z.boolean(),
    consentNote: text(200),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .superRefine((story, ctx) => {
    // The site promises names, photos, scores, and destinations appear only with written consent.
    if (story.published && !story.consent) ctx.addIssue({ code: "custom", path: ["consent"], message: "Confirm written consent before publishing" });
    if (story.published && !story.consentNote) ctx.addIssue({ code: "custom", path: ["consentNote"], message: "Note where the signed consent is kept" });
    if (story.scoreAfter && !story.scoreBefore) ctx.addIssue({ code: "custom", path: ["scoreBefore"], message: "Add the starting score too" });
  });

export type StoryInput = z.input<typeof storyInputSchema>;

/** A story as the site renders it. */
export type Story = {
  slug: string;
  studentName: string;
  headline: string;
  paragraphs: string[];
  program: { slug: string; name: string } | null;
  scoreLabel: string;
  scoreBefore: string;
  scoreAfter: string;
  /** "+1.5" when both scores are numbers, else null. */
  scoreGain: string | null;
  destination: string;
  country: string;
  countryCode: string | null;
  intake: string;
  photo: string | null;
  photoAlt: string;
  featured: boolean;
};
