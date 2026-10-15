import { describe, expect, test } from "bun:test";
import { findOverbooking } from "../../src/lib/sponsors/booking";
import { trackedHref } from "../../src/lib/sponsors/href";
import { adInputSchema, type AdInput } from "../../src/lib/sponsors/schema";
import { isLive } from "../../src/lib/sponsors/select";
import { slotIds } from "../../src/lib/sponsors/slots";

const copy = {
  en: { title: "Study engineering in Melbourne", body: "Scholarships for Indonesian students.", cta: "See scholarships" },
};

const university: AdInput = {
  id: null,
  slug: "sample-university-2027",
  advertiser: "Sample University",
  kind: "university",
  country: "Australia",
  city: "Melbourne",
  majors: ["Engineering", "Computer Science"],
  slots: ["universities", "home-hero"],
  programs: [],
  startsOn: "2027-01-01",
  endsOn: "2027-01-31",
  active: true,
  weight: 1,
  href: "https://example.edu/apply",
  image: "/media/cm0sampleimage00000000000",
  logo: null,
  copy,
};

const wib = (iso: string) => new Date(`${iso}+07:00`).getTime();
const booking = (slug: string, slots: string[], startsOn: string, endsOn: string) => ({ slug, slots, startsOn, endsOn });

describe("sponsor campaigns", () => {
  test("accepts a complete university campaign", () => {
    expect(adInputSchema.safeParse(university).success).toBe(true);
  });

  test("rejects long copy, missing art, outside images, plain http, and reversed dates", () => {
    const long = { ...university, copy: { ...copy, en: { ...copy.en, title: "x".repeat(61) } } };
    expect(adInputSchema.safeParse(long).success).toBe(false);
    expect(adInputSchema.safeParse({ ...university, image: null }).success).toBe(false);
    expect(adInputSchema.safeParse({ ...university, image: "https://cdn.example.com/a.jpg" }).success).toBe(false);
    expect(adInputSchema.safeParse({ ...university, href: "http://example.edu" }).success).toBe(false);
    expect(adInputSchema.safeParse({ ...university, startsOn: "2027-02-01" }).success).toBe(false);
  });

  test("the universities placement needs a university with a country", () => {
    expect(adInputSchema.safeParse({ ...university, kind: "brand" }).success).toBe(false);
    expect(adInputSchema.safeParse({ ...university, country: "" }).success).toBe(false);
  });

  test("ads run only in the hero banner and the Study abroad universities", () => {
    expect(slotIds).toEqual(["home-hero", "universities"]);
    for (const retired of ["home-feature", "home-card", "study-abroad-featured", "program", "articles-row", "expo-partners", "footer-partners"]) {
      expect(adInputSchema.safeParse({ ...university, slots: [retired] }).success).toBe(false);
    }
  });

  test("a brand can book the hero banner, which needs an image", () => {
    const brand = { ...university, kind: "brand" as const, country: "", city: "", majors: [], slots: ["home-hero" as const] };
    expect(adInputSchema.safeParse(brand).success).toBe(true);
    expect(adInputSchema.safeParse({ ...brand, image: null, logo: "/media/cm0samplelogo000000000000" }).success).toBe(false);
  });
});

describe("booking limits", () => {
  test("the hero carousel takes at most three sponsored slides on any day", () => {
    const taken = [booking("a", ["home-hero"], "2027-01-01", "2027-01-31"), booking("b", ["home-hero"], "2027-01-10", "2027-01-20")];
    expect(findOverbooking(booking("c", ["home-hero"], "2027-01-05", "2027-01-25"), taken)).toBeNull();
    const fourth = [...taken, booking("c", ["home-hero"], "2027-01-15", "2027-01-16")];
    expect(findOverbooking(booking("d", ["home-hero"], "2027-01-12", "2027-01-18"), fourth)?.conflicts).toEqual(["a", "b", "c"]);
  });

  test("university listings are never capped", () => {
    const many = Array.from({ length: 10 }, (_, index) => booking(`u${index}`, ["universities"], "2027-01-01", "2027-12-31"));
    expect(findOverbooking(booking("new", ["universities"], "2027-03-01", "2027-03-31"), many)).toBeNull();
  });

  test("retired placements on old campaigns are ignored", () => {
    const old = ["x", "y", "z"].map((slug) => booking(slug, ["home-feature"], "2027-01-01", "2027-01-31"));
    expect(findOverbooking(booking("legacy", ["home-feature", "program"], "2027-01-01", "2027-01-31"), old)).toBeNull();
  });
});

describe("delivery", () => {
  test("a campaign is live for its whole end day in Medan time", () => {
    const ad = { start: "2027-01-01", end: "2027-01-31" };
    expect(isLive(ad, wib("2026-12-31T23:59:59"))).toBe(false);
    expect(isLive(ad, wib("2027-01-01T00:00:00"))).toBe(true);
    expect(isLive(ad, wib("2027-01-31T23:59:59"))).toBe(true);
    expect(isLive(ad, wib("2027-02-01T00:00:00"))).toBe(false);
  });

  test("links get UTM tags without overwriting the sponsor's own", () => {
    const url = new URL(trackedHref("https://example.edu/apply?utm_source=partner", "sample-2027", "home-hero", "example.com"));
    expect(url.searchParams.get("utm_source")).toBe("partner");
    expect(url.searchParams.get("utm_medium")).toBe("sponsored");
    expect(url.searchParams.get("utm_campaign")).toBe("sample-2027");
    expect(url.searchParams.get("utm_content")).toBe("home-hero");
  });
});
