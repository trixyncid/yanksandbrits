import { z } from "zod";

export const faqInputSchema = z.object({
  id: z.string().min(1).nullable(),
  question: z.string().trim().min(1, "Question is required").max(200),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
  category: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || "General"),
  programs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(20),
  showOnContact: z.boolean(),
  published: z.boolean(),
});

export type FaqInput = z.input<typeof faqInputSchema>;

/** A question as the site renders it. `id` doubles as its link: /faq#<id>. */
export type Faq = { id: string; question: string; answer: string; paragraphs: string[]; category: string; programs: string[]; showOnContact: boolean };
