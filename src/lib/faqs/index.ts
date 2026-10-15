import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { paragraphs } from "@/lib/stories/format";
import type { Faq } from "./schema";

export const faqsTag = "faqs";

/** Published questions in the CMS order. Empty until the CMS has some. */
export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheTag(faqsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db.faq.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      paragraphs: paragraphs(row.answer),
      category: row.category,
      programs: row.programs,
      showOnContact: row.showOnContact,
    }));
  } catch (error) {
    console.error("[faqs] Not shown:", error instanceof Error ? error.message : error);
    return [];
  }
}

/** For a program page: its own questions first, then the general ones. */
export async function getProgramFaqs(program: string, limit = 6) {
  const faqs = await getFaqs();
  return [...faqs.filter((faq) => faq.programs.includes(program)), ...faqs.filter((faq) => faq.programs.length === 0)].slice(0, limit);
}

/** The questions ticked "Show on the Contact page". */
export async function getContactFaqs() {
  return (await getFaqs()).filter((faq) => faq.showOnContact);
}
