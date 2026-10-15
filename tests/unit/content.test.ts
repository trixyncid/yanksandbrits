import { describe, expect, test } from "bun:test";
import { en } from "../../src/content/en";
import { getBundledPrograms } from "../../src/lib/content";
import enJson from "../../messages/en.json";

const banned = ["yanks", "brits", "yanksandbrits", "dewa ruci", "88815181"];

describe("content", () => {
  test("publishes the four programs from the brief", () => {
    expect(getBundledPrograms("en").map((program) => program.slug)).toEqual([
      "ielts",
      "toefl",
      "computer-science",
      "hsk",
    ]);
  });

  test("keeps titles and descriptions inside the metadata limits", () => {
    for (const bundle of [en]) {
      for (const seo of Object.values(bundle.seo)) {
        expect(seo.title.length).toBeLessThanOrEqual(34);
        expect(seo.description.length).toBeLessThanOrEqual(155);
      }
      for (const program of bundle.programs) {
        expect(program.seoTitle.length).toBeLessThanOrEqual(34);
        expect(program.seoDescription.length).toBeLessThanOrEqual(155);
      }
    }
  });

  test("keeps the next-intl catalogs in step with the content modules", () => {
    expect(enJson).toEqual(en);
  });

  test("has no placeholder markers or sample figures", () => {
    const blob = JSON.stringify(en);
    expect(blob).not.toMatch(/\[REPLACE|\bsample\b|lorem|placeholder|not a live product/i);
  });

  test("does not carry facts from the previous public site", () => {
    const blob = JSON.stringify(en).toLowerCase();
    for (const word of banned) {
      expect(new RegExp(`\\b${word}\\b`, "i").test(blob)).toBe(false);
    }
  });
});
