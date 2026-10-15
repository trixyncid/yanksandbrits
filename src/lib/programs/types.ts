export type ProgramModule = { title: string; body: string };

// What every public page renders, whether it comes from the CMS or the bundled fallback.
export type Program = {
  slug: string;
  category: "language" | "academic";
  name: string;
  tag: string;
  headline: string;
  summary: string;
  targetAudience: string;
  format: "online" | "offline" | "hybrid";
  formatLabel: string;
  duration: string;
  schedule: string;
  level: string;
  outcomes: string[];
  syllabus: ProgramModule[];
  image: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
};

export type ProgramLink = Pick<Program, "slug" | "name">;

export const defaultProgramImage = "/images/study.jpg";

