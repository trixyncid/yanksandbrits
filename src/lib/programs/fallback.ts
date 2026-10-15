import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { getBundledPrograms } from "@/lib/content";
import { defaultProgramImage, type Program, type ProgramModule } from "./types";

const bundledPhotos: Record<string, string> = {
  ielts: "/images/class.jpg",
  toefl: "/images/study.jpg",
  "computer-science": "/images/london.jpg",
  hsk: "/images/dest-sg.jpg",
};

const moduleSchema = z.array(z.object({ title: z.string(), body: z.string().default("") }));

export function parseModules(value: unknown): ProgramModule[] {
  const parsed = moduleSchema.safeParse(value);
  return parsed.success ? parsed.data.filter((item) => item.title.trim()) : [];
}

// Bundled copy keeps the site complete before the CMS is seeded, and in builds without a database.
export function fallbackPrograms(locale: Locale): Program[] {
  return getBundledPrograms(locale).map((program) => ({
    ...program,
    syllabus: program.syllabus.map((title) => ({ title, body: "" })),
    image: bundledPhotos[program.slug] ?? defaultProgramImage,
    imageAlt: "",
  }));
}
