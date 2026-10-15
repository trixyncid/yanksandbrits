import { describe, expect, test } from "bun:test";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { channelFor } from "../../src/lib/leads/channel";
import { buildLeadsWorkbook, statuses, type ExportLead } from "../../src/lib/leads/workbook";
import { formatWhatsapp } from "../../src/lib/validation/phone";

describe("lead channel", () => {
  test("paid campaigns split into search and social", () => {
    expect(channelFor({ utmSource: "google", utmMedium: "cpc" })).toBe("Paid search");
    expect(channelFor({ utmSource: "instagram", utmMedium: "cpc" })).toBe("Paid social");
    expect(channelFor({ utmSource: "facebook", utmMedium: "paid_social" })).toBe("Paid social");
    expect(channelFor({ utmSource: "tiktok", utmMedium: "paid" })).toBe("Paid social");
  });

  test("tagged but unpaid links", () => {
    expect(channelFor({ utmSource: "newsletter", utmMedium: "email" })).toBe("Email");
    expect(channelFor({ utmSource: "instagram", utmMedium: "social" })).toBe("Organic social");
    expect(channelFor({ utmSource: "instagram" })).toBe("Organic social");
    expect(channelFor({ utmSource: "partner-school", utmMedium: "referral" })).toBe("Referral");
    expect(channelFor({ utmSource: "expo-booth", utmMedium: "qr" })).toBe("Other campaign");
  });

  test("untagged visits fall back to the referrer", () => {
    expect(channelFor({ referrer: "https://www.google.co.id/" })).toBe("Organic search");
    expect(channelFor({ referrer: "https://l.instagram.com/" })).toBe("Organic social");
    expect(channelFor({ referrer: "https://t.co/abc" })).toBe("Organic social");
    expect(channelFor({ referrer: "https://some-blog.example/post" })).toBe("Referral");
    expect(channelFor({ referrer: "" })).toBe("Direct");
    expect(channelFor({})).toBe("Direct");
  });
});

test("formats WhatsApp numbers for people", () => {
  expect(formatWhatsapp("6281234567890")).toBe("+62 812-3456-7890");
});

describe("leads workbook", () => {
  const lead: ExportLead = {
    id: "0f1e2d3c-4b5a-6978-8a9b-0c1d2e3f4a5b",
    createdAt: new Date("2026-10-15T02:30:00Z"),
    locale: "id",
    origin: "whatsapp",
    name: "Sari",
    whatsapp: "6281234567890",
    programs: ["ielts", "retired-program"],
    channel: "Paid social",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "ielts-oct",
    utmTerm: null,
    utmContent: null,
    firstUtmCampaign: null,
    referrer: null,
    landingPage: "/programs/ielts",
    device: "mobile",
    submissions: 2,
    counsellor: { name: "Ayu" },
    assignedAt: new Date("2026-10-15T03:00:00Z"),
  };

  async function build(leads: ExportLead[]) {
    const buffer = await buildLeadsWorkbook({
      leads,
      programs: [{ slug: "ielts", name: "IELTS" }],
      counsellors: ["Ayu", "Budi"],
      generatedAt: new Date("2026-10-15T05:00:00Z"),
      generatedBy: "admin@example.com",
      scope: "Last 30 days",
    });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    return workbook;
  }

  const header = (sheet: ExcelJS.Worksheet, name: string) => {
    let found = 0;
    sheet.getRow(1).eachCell((cell, index) => {
      if (cell.value === name) found = index;
    });
    expect(found).toBeGreaterThan(0);
    return found;
  };

  test("has the team's sheets, with the dropdown source hidden", async () => {
    const workbook = await build([lead]);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(["Leads", "Counsellors", "Summary", "Lists", "How to use"]);
    expect(workbook.getWorksheet("Lists")?.state).toBe("hidden");
    const lists = workbook.getWorksheet("Lists")!;
    expect(statuses.map((_, index) => lists.getCell(`A${index + 2}`).value)).toEqual([...statuses]);
  });

  test("writes a lead row in WIB, with a chat link and readable labels", async () => {
    const sheet = (await build([lead])).getWorksheet("Leads")!;
    const row = sheet.getRow(2);
    expect(row.getCell(header(sheet, "Lead ID")).value).toBe("0F1E2D3C");
    // 02:30 UTC is 09:30 in Medan.
    expect((row.getCell(header(sheet, "Received (WIB)")).value as Date).toISOString()).toBe("2026-10-15T09:30:00.000Z");
    expect(row.getCell(header(sheet, "WhatsApp")).value).toEqual({ text: "+62 812-3456-7890", hyperlink: "https://wa.me/6281234567890" });
    expect(row.getCell(header(sheet, "Programs")).value).toBe("IELTS, retired-program");
    expect(row.getCell(header(sheet, "Status")).value).toBe("New");
    expect(row.getCell(header(sheet, "Form")).value).toBe("WhatsApp popup");
    expect(row.getCell(header(sheet, "Language")).value).toBe("Indonesian");
    expect(row.getCell(header(sheet, "Times submitted")).value).toBe(2);
    // Assignment made in the CMS arrives pre-filled; 03:00 UTC is 10:00 in Medan.
    expect(row.getCell(header(sheet, "Assigned counsellor")).value).toBe("Ayu");
    expect((row.getCell(header(sheet, "Assigned on")).value as Date).toISOString()).toBe("2026-10-15T10:00:00.000Z");
  });

  test("puts dropdowns on whole columns, once each", async () => {
    // Read the sheet XML itself: overlapping rules there make Excel offer to "repair" the file.
    const buffer = await buildLeadsWorkbook({ leads: [lead], programs: [], counsellors: [], generatedAt: new Date(), generatedBy: "a", scope: "b" });
    const xml = await (await JSZip.loadAsync(buffer)).file("xl/worksheets/sheet1.xml")!.async("string");
    const rules = [...xml.matchAll(/<dataValidation [^>]*sqref="([^"]+)"[^>]*>\s*<formula1>([^<]*)<\/formula1>/g)].map(([, sqref, formula]) => ({ sqref, formula }));
    expect(rules).toHaveLength(4);
    expect(new Set(rules.map((rule) => rule.sqref)).size).toBe(4);
    // Covers the data plus room to paste later exports.
    expect(rules.find((rule) => rule.formula.startsWith("Counsellors!"))?.sqref).toMatch(/^G2:G\d{4,}$/);
    expect(rules.find((rule) => rule.formula.startsWith("Lists!"))?.sqref).toMatch(/^I2:I\d{4,}$/);
  });

  test("lists counsellors from the CMS and works with no leads", async () => {
    const workbook = await build([]);
    const team = workbook.getWorksheet("Counsellors")!;
    expect(team.getCell("A2").value).toBe("Ayu");
    expect(team.getCell("A3").value).toBe("Budi");
    expect(workbook.getWorksheet("Leads")!.getCell("D2").value).toBeNull();
  });
});
