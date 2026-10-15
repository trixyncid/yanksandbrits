import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { countryCode } from "@/lib/countries";
import { db } from "@/lib/db";
import { getPrograms } from "@/lib/programs";
import { paragraphs, scoreGain } from "./format";
import type { Story } from "./schema";

export const storiesTag = "stories";

/**
 * Published stories: featured first, then the CMS order. The CMS refuses to publish a story
 * without recorded consent, so everything here may be shown. Empty until the CMS has any.
 */
export async function getStories(): Promise<Story[]> {
  "use cache";
  cacheTag(storiesTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    const [rows, programs] = await Promise.all([
      db.story.findMany({ where: { published: true, consent: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }] }),
      getPrograms("en"),
    ]);
    return rows.map((row) => {
      const program = programs.find((item) => item.slug === row.program);
      return {
        slug: row.slug,
        studentName: row.studentName,
        headline: row.headline,
        paragraphs: paragraphs(row.body),
        program: program ? { slug: program.slug, name: program.name } : null,
        scoreLabel: row.scoreLabel,
        scoreBefore: row.scoreBefore,
        scoreAfter: row.scoreAfter,
        scoreGain: scoreGain(row.scoreBefore, row.scoreAfter),
        destination: row.destination,
        country: row.country,
        countryCode: row.country ? countryCode(row.country) : null,
        intake: row.intake,
        photo: row.photo,
        photoAlt: row.photoAlt ?? "",
        featured: row.featured,
      };
    });
  } catch (error) {
    console.error("[stories] Not shown:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getStory(slug: string) {
  return (await getStories()).find((story) => story.slug === slug) ?? null;
}
