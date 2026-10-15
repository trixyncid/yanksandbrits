import { describe, expect, test } from "bun:test";
import { docText, readingMinutes, sanitizeDoc, slugify, type DocNode } from "../../src/lib/cms/document";
import { articleState } from "../../src/lib/cms/status";
import { articleInputSchema } from "../../src/lib/cms/validation";

const doc = (content: DocNode[]): DocNode => ({ type: "doc", content });

describe("cms document", () => {
  test("drops unsafe links and images but keeps the text", () => {
    const clean = sanitizeDoc(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bad", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }, { type: "bold" }] },
            { type: "text", text: "good", marks: [{ type: "link", attrs: { href: "https://example.com" } }] },
          ],
        },
        { type: "image", attrs: { src: "data:image/svg+xml,<svg/>" } },
        { type: "image", attrs: { src: "/images/a.jpg" } },
      ]),
    );
    const [paragraph, image] = clean?.content ?? [];
    expect(paragraph.content?.[0]).toEqual({ type: "text", text: "bad", marks: [{ type: "bold" }] });
    expect(paragraph.content?.[1].marks?.[0].attrs?.href).toBe("https://example.com");
    expect(clean?.content).toHaveLength(2);
    expect(image.attrs?.src).toBe("/images/a.jpg");
  });

  test("slugifies Indonesian and English titles", () => {
    expect(slugify("Persiapan IELTS: Band 7.0 dalam 3 Bulan!")).toBe("persiapan-ielts-band-7-0-dalam-3-bulan");
    expect(slugify("  Études à l'étranger  ")).toBe("etudes-a-l-etranger");
    expect(slugify("---")).toBe("");
  });

  test("counts reading time from the document text", () => {
    const words = Array.from({ length: 450 }, () => "kata").join(" ");
    const text = docText(doc([{ type: "paragraph", content: [{ type: "text", text: words }] }]));
    expect(readingMinutes(text.split(/\s+/).filter(Boolean).length)).toBe(2);
    expect(readingMinutes(0)).toBe(1);
  });

  test("treats a future publish date as scheduled", () => {
    const now = new Date("2026-10-13T00:00:00Z");
    expect(articleState({ status: "draft", publishedAt: null }, now)).toBe("draft");
    expect(articleState({ status: "published", publishedAt: new Date("2026-10-12T00:00:00Z") }, now)).toBe("published");
    expect(articleState({ status: "published", publishedAt: new Date("2026-10-14T00:00:00Z") }, now)).toBe("scheduled");
  });
});

describe("cms validation", () => {
  const valid = {
    id: null,
    locale: "en",
    title: "Judul",
    slug: "judul",
    excerpt: "",
    content: doc([{ type: "paragraph" }]),
    coverImage: "",
    coverAlt: "",
    category: "",
    tags: [],
    status: "draft",
    publishedAt: null,
    seoTitle: "",
    seoDescription: "",
    noindex: false,
  } as const;

  test("accepts a minimal draft and turns empty optional text into null", () => {
    const parsed = articleInputSchema.parse(valid);
    expect(parsed.coverImage).toBeNull();
    expect(parsed.seoTitle).toBeNull();
  });

  test("rejects bad slugs, script cover URLs, and long SEO fields", () => {
    expect(articleInputSchema.safeParse({ ...valid, slug: "Bad Slug" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...valid, coverImage: "javascript:alert(1)" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...valid, seoDescription: "x".repeat(156) }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...valid, content: { type: "paragraph" } }).success).toBe(false);
  });
});

describe("programs", () => {
  test("bundled fallback covers every program with modules and an image", async () => {
    const { fallbackPrograms } = await import("../../src/lib/programs/fallback");
    const programs = fallbackPrograms("en");
    expect(programs.map((program) => program.slug)).toEqual(["ielts", "toefl", "computer-science", "hsk"]);
    for (const program of programs) {
      expect(program.syllabus.length).toBeGreaterThan(0);
      expect(program.image.startsWith("/images/")).toBe(true);
    }
  });

  test("program input keeps images on this site and SEO titles short", async () => {
    const { programInputSchema } = await import("../../src/lib/cms/validation");
    const base = {
      id: null, locale: "en", slug: "sat-prep", published: true, category: "academic", name: "SAT", tag: "", headline: "",
      summary: "Prep.", targetAudience: "", format: "hybrid", formatLabel: "", duration: "", schedule: "", level: "",
      outcomes: [], syllabus: [], image: "/images/class.jpg", imageAlt: "", seoTitle: "", seoDescription: "",
    };
    expect(programInputSchema.safeParse(base).success).toBe(true);
    expect(programInputSchema.safeParse({ ...base, image: "https://evil.example/x.jpg" }).success).toBe(false);
    expect(programInputSchema.safeParse({ ...base, seoTitle: "x".repeat(35) }).success).toBe(false);
    expect(programInputSchema.safeParse({ ...base, syllabus: [{ title: "", body: "x" }] }).success).toBe(false);
  });
});

describe("people", () => {
  test("counsellor input needs both languages and a site photo", async () => {
    const { counsellorInputSchema } = await import("../../src/lib/cms/validation");
    const text = { role: "Education counsellor", bio: "", specialisations: ["IELTS"], countries: ["United Kingdom"] };
    const base = { id: null, slug: "ayu", name: "Ayu", photo: "/media/cm0samplephoto0000000000", published: true, onDesk: true, content: { en: text } };
    expect(counsellorInputSchema.safeParse(base).success).toBe(true);
    // The private WhatsApp number is optional, normalized, and checked.
    expect(counsellorInputSchema.parse({ ...base, whatsapp: "0812 3456 7890" }).whatsapp).toBe("6281234567890");
    expect(counsellorInputSchema.parse({ ...base, whatsapp: "" }).whatsapp).toBeNull();
    expect(counsellorInputSchema.safeParse({ ...base, whatsapp: "12345" }).success).toBe(false);
    // English is required; Bahasa-only text (from before the site went English only) is not enough.
    expect(counsellorInputSchema.safeParse({ ...base, content: { id: text } }).success).toBe(false);
    // Older records that still hold Bahasa text alongside English stay valid.
    expect(counsellorInputSchema.safeParse({ ...base, content: { id: text, en: text } }).success).toBe(true);
    expect(counsellorInputSchema.safeParse({ ...base, photo: "https://example.com/a.jpg" }).success).toBe(false);
  });
});

describe("temporary passwords", () => {
  test("are long, readable, and different each time", async () => {
    const { mock } = await import("bun:test");
    mock.module("server-only", () => ({}));
    const { temporaryPassword } = await import("../../src/lib/cms/users");
    const passwords = new Set(Array.from({ length: 200 }, () => temporaryPassword()));
    expect(passwords.size).toBe(200);
    for (const password of passwords) {
      expect(password).toMatch(/^[A-HJ-NP-Za-km-z2-9]{4}(-[A-HJ-NP-Za-km-z2-9]{4}){3}$/);
      expect(password).not.toMatch(/[01OlI]/);
    }
  });
});
