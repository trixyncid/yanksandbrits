import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { CounsellorContent } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  counsellorContentSchema,
  tutorContentSchema,
  type TutorProfile,
} from "./types";

export const counsellorsTag = "counsellors";
export const tutorsTag = "tutors";

/** Published counsellors in display order. Empty until the CMS has some (the page then leaves the team out). */
export async function getCounsellors(
  locale: Locale,
): Promise<CounsellorContent[]> {
  "use cache";
  cacheTag(counsellorsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db.counsellor.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.flatMap((row) => {
      const content = counsellorContentSchema.safeParse(row.content);
      if (!row.published || !content.success) return [];
      return [
        {
          slug: row.slug,
          name: row.name,
          photo: row.photo,
          active: row.onDesk,
          ...content.data[locale],
        },
      ];
    });
  } catch (error) {
    console.error(
      "[counsellors] Could not load counsellors:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/** Published tutors, featured first. There is no bundled fallback: the page shows its empty state. */
export async function getTutors(locale: Locale): Promise<TutorProfile[]> {
  "use cache";
  cacheTag(tutorsTag);
  cacheLife("hours");

  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db.tutor.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.flatMap((row) => toProfile(row, locale) ?? []);
  } catch (error) {
    console.error(
      "[tutors] Tutor profiles are unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

function toProfile(
  row: {
    slug: string;
    name: string;
    photo: string | null;
    featured: boolean;
    programs: string[];
    languages: string[];
    content: unknown;
  },
  locale: Locale,
): TutorProfile | null {
  const content = tutorContentSchema.safeParse(row.content);
  if (!content.success) return null;
  const { slug, name, photo, featured, programs, languages } = row;
  return {
    slug,
    name,
    photo,
    featured,
    programs,
    languages,
    ...content.data[locale],
  };
}

/**
 * One tutor, read at request time. Profile pages use this instead of the cached list: their slugs
 * are not prerendered, and in Next.js 16.4 the first render after a CMS save can still see the
 * previous cached list there, which would show a new tutor as "not found".
 */
export async function getTutorFresh(
  locale: Locale,
  slug: string,
): Promise<TutorProfile | null> {
  await connection();
  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await db.tutor.findFirst({ where: { slug, published: true } });
    return row ? toProfile(row, locale) : null;
  } catch {
    return null;
  }
}

export async function getTutor(locale: Locale, slug: string) {
  return (await getTutors(locale)).find((tutor) => tutor.slug === slug) ?? null;
}
