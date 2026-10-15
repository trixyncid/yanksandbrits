import { describe, expect, test } from "bun:test";
import { normalizeWhatsapp } from "../../src/lib/validation/phone";

describe("normalizeWhatsapp", () => {
  test("accepts local, country, and plus formats", () => {
    expect(normalizeWhatsapp("0812-3456-7890")).toBe("6281234567890");
    expect(normalizeWhatsapp("+62 812 3456 7890")).toBe("6281234567890");
    expect(normalizeWhatsapp("6281234567890")).toBe("6281234567890");
  });

  test("rejects landlines, empty values, and short numbers", () => {
    expect(normalizeWhatsapp("021-555-0100")).toBeNull();
    expect(normalizeWhatsapp("")).toBeNull();
    expect(normalizeWhatsapp("0812")).toBeNull();
    expect(normalizeWhatsapp("hello")).toBeNull();
  });
});
