import { en } from "@/content/en";
import {
  programSlugs,
  type Bundle,
  type FaqContent,
  type ProgramContent,
} from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { z } from "zod";

// English only. The `locale` parameters below stay so callers keep one signature.
const bundles: Record<Locale, Bundle> = { en };

const programSchema = z.object({
  slug: z.enum(programSlugs),
  category: z.enum(["language", "academic"]),
  name: z.string().min(1),
  headline: z.string().min(1),
  tag: z.string().min(1),
  summary: z.string().min(1),
  outcomes: z.array(z.string()).min(1),
  targetAudience: z.string().min(1),
  format: z.literal("hybrid"),
  formatLabel: z.string().min(1),
  // Set per program in the CMS once confirmed; empty hides them on the site.
  duration: z.string(),
  schedule: z.string(),
  level: z.string().min(1),
  syllabus: z.array(z.string()).min(1),
  seoTitle: z.string().min(1).max(34),
  seoDescription: z.string().min(1).max(155),
});

const faqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  relatedProgram: z.enum(programSlugs).nullable(),
});

export function getBundle(locale: Locale) {
  return bundles[locale];
}

// Seed data and fallback for the CMS. Pages read programs through `@/lib/programs`.
export function getBundledPrograms(locale: Locale): ProgramContent[] {
  return z.array(programSchema).parse(bundles[locale].programs);
}

// Starting questions for `bun run db:seed`. The site reads FAQs from the CMS (src/lib/faqs).
export function getBundledFaqs(locale: Locale, program?: string): FaqContent[] {
  const faqs = z.array(faqSchema).parse(bundles[locale].faqs);
  if (!program) return faqs;
  return faqs.filter((faq) => faq.relatedProgram === program || faq.relatedProgram === null);
}



export function getSettings() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://example.com";
  return {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "Yanks and Brits",
    tagline: process.env.NEXT_PUBLIC_TAGLINE?.trim() || null,
    siteUrl,
    domainConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    // Search engines may index only a production deploy with its domain set. Staging sets NEXT_PUBLIC_NOINDEX=true.
    indexable: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()) && process.env.NEXT_PUBLIC_NOINDEX?.trim() !== "true",
    whatsapp: digits(process.env.NEXT_PUBLIC_WA_NUMBER),
    email: process.env.NEXT_PUBLIC_EMAIL?.trim() || null,
    phone: process.env.NEXT_PUBLIC_PHONE?.trim() || null,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM?.trim() || null,
    tiktok: process.env.NEXT_PUBLIC_TIKTOK?.trim() || null,
    youtube: process.env.NEXT_PUBLIC_YOUTUBE?.trim() || null,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK?.trim() || null,
    gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() || null,
    city: "Medan",
    region: "Sumatera Utara",
    country: "Indonesia",
    countryCode: "ID",
  };
}

function digits(value: string | undefined) {
  const raw = value?.replace(/[^\d]/g, "") ?? "";
  return raw || null;
}

export function whatsappHref(message: string) {
  const number = getSettings().whatsapp;
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function messageFor(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
