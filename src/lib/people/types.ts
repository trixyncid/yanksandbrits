import { z } from "zod";

const list = (max: number, item = 80) => z.array(z.string().trim().min(1).max(item)).max(max);

export const counsellorTextSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(80),
  bio: z.string().trim().max(400),
  specialisations: list(8),
  countries: list(10),
});

export const tutorTextSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(80),
  bio: z.string().trim().max(800),
  subjects: list(10),
  education: list(6, 160),
  certifications: list(8, 120),
  experience: z.string().trim().max(300),
  results: z.string().trim().max(300),
});

export type CounsellorText = z.infer<typeof counsellorTextSchema>;
export type TutorText = z.infer<typeof tutorTextSchema>;

// English only. Older records may still carry an `id` (Bahasa) block; parsing drops it.
export const counsellorContentSchema = z.object({ en: counsellorTextSchema });
export const tutorContentSchema = z.object({ en: tutorTextSchema });

export const emptyCounsellorText: CounsellorText = { role: "", bio: "", specialisations: [], countries: [] };
export const emptyTutorText: TutorText = { role: "", bio: "", subjects: [], education: [], certifications: [], experience: "", results: "" };

/** A tutor as the public pages render it, in one language. */
export type TutorProfile = TutorText & {
  slug: string;
  name: string;
  photo: string | null;
  featured: boolean;
  programs: string[];
  languages: string[];
};
