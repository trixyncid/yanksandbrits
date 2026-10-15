import { z } from "zod";
import { isSiteImage } from "@/lib/media/types";

export const testimonialInputSchema = z.object({
  id: z.string().min(1).nullable(),
  quote: z.string().trim().min(1, "Quote is required").max(400),
  name: z.string().trim().min(1, "Name is required").max(80),
  role: z.string().trim().max(80),
  photo: z
    .string()
    .trim()
    .refine((value) => value === "" || isSiteImage(value), "Upload the photo or pick it from the library")
    .transform((value) => value || null),
  published: z.boolean(),
});

export type TestimonialInput = z.input<typeof testimonialInputSchema>;

/** A testimonial as the home page renders it. */
export type Testimonial = { id: string; quote: string; name: string; role: string; photo: string | null };
