import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Testimonial } from "./schema";

export const testimonialsTag = "testimonials";

/** Published testimonials in display order. Empty until the CMS has some: there are no samples. */
export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheTag(testimonialsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    return await db.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, quote: true, name: true, role: true, photo: true },
    });
  } catch (error) {
    console.error("[testimonials] Not shown:", error instanceof Error ? error.message : error);
    return [];
  }
}
