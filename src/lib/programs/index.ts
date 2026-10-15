import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { fallbackPrograms, parseModules } from "./fallback";
import { defaultProgramImage, type Program } from "./types";

export { parseModules };

export const programsTag = "programs";

/** Published programs in display order. Cached; CMS saves refresh it through the `programs` tag. */
export async function getPrograms(locale: Locale): Promise<Program[]> {
  "use cache";
  cacheTag(programsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return fallbackPrograms(locale);

  try {
    const rows = await db.program.findMany({
      where: { locale },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    // Only a table with no programs at all means the CMS was never seeded. If it has programs but
    // none in this language, say so instead of quietly showing the bundled copy.
    if (rows.length === 0) {
      if ((await db.program.count()) === 0) return fallbackPrograms(locale);
      console.warn(`[programs] The CMS has no "${locale}" programs. Import them with \`bun run db:seed\`.`);
    }
    return rows.filter((row) => row.published).map(toProgram);
  } catch (error) {
    console.error(
      "[programs] Falling back to bundled programs:",
      error instanceof Error ? error.message : error,
    );
    return fallbackPrograms(locale);
  }
}

type ProgramRow = Awaited<ReturnType<typeof db.program.findMany>>[number];

function toProgram(row: ProgramRow): Program {
  return {
    slug: row.slug,
    category: row.category,
    name: row.name,
    tag: row.tag,
    headline: row.headline || row.name,
    summary: row.summary,
    targetAudience: row.targetAudience,
    format: row.format,
    formatLabel: row.formatLabel,
    duration: row.duration,
    schedule: row.schedule,
    level: row.level,
    outcomes: row.outcomes,
    syllabus: parseModules(row.syllabus),
    image: row.image || defaultProgramImage,
    imageAlt: row.imageAlt ?? "",
    seoTitle: row.seoTitle || row.name.slice(0, 34),
    seoDescription: row.seoDescription || row.summary.slice(0, 155),
  };
}

export async function getProgram(locale: Locale, slug: string) {
  const programs = await getPrograms(locale);
  return programs.find((program) => program.slug === slug) ?? null;
}

/**
 * Request-time lookup for a slug the cached list does not have yet. Programs created after a build
 * are not prerendered, and in Next.js 16.4 their first render after a CMS save can still see the
 * previous cached list, which would show the new program as "not found".
 */
export async function getProgramFresh(
  locale: Locale,
  slug: string,
): Promise<Program | null> {
  await connection();
  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await db.program.findFirst({
      where: { locale, slug, published: true },
    });
    return row ? toProgram(row) : null;
  } catch {
    return null;
  }
}
