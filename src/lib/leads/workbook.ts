// The leads export: a working file the marketing team uses to hand leads to counsellors and track follow-up.
// Distribution columns, dropdowns, highlights, and the summary are all live Excel features, so the file keeps
// working as the team edits it. Opens in Excel 2016+, Google Sheets, and LibreOffice.

import ExcelJS from "exceljs";
import { formatWhatsapp } from "@/lib/validation/phone";
import { channels } from "./channel";

export type ExportLead = {
  id: string;
  createdAt: Date;
  locale: "id" | "en";
  origin: "contact" | "whatsapp";
  name: string;
  whatsapp: string;
  programs: string[];
  channel: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  firstUtmCampaign: string | null;
  referrer: string | null;
  landingPage: string | null;
  device: string | null;
  submissions: number;
  /** Assignment made in the CMS, if any. */
  counsellor: { name: string } | null;
  assignedAt: Date | null;
};

export type WorkbookInput = {
  leads: ExportLead[];
  /** slug -> display name */
  programs: { slug: string; name: string }[];
  counsellors: string[];
  generatedAt: Date;
  generatedBy: string;
  /** Plain-language description of the filters, printed on the guide sheet. */
  scope: string;
};

// Pipeline stages, in order. "Closed" ones no longer need follow-up.
export const statuses = ["New", "Contacted", "Consultation booked", "Enrolled", "No response", "Not interested", "Invalid number"] as const;
const closed = ["Enrolled", "Not interested", "Invalid number"];

const WIB = 7 * 60 * 60 * 1000;
// Room for the team to paste later exports under this one and keep every rule working.
const BUFFER = 5000;
const COUNSELLOR_ROWS = 40;

const ink = "FF0D1538";
const blue = "FF253CA1";
const palette = {
  header: blue,
  headerText: "FFFFFFFF",
  distribution: "FFE9ECF6",
  red: "FFFDE2E1",
  redText: "FF991B1B",
  amber: "FFFEF3C7",
  amberText: "FF92400E",
  green: "FFDCFCE7",
  greenText: "FF166534",
  sky: "FFE0F2FE",
  grey: "FFEDEEF0",
  greyText: "FF5C5F69",
};


/** Excel has no time zones: shift to Medan time so the clock in the cell is what the team expects. */
const wib = (date: Date) => new Date(date.getTime() + WIB);

function sourceOf(lead: ExportLead) {
  if (lead.utmSource) return lead.utmSource;
  if (!lead.referrer) return "(direct)";
  try {
    return new URL(lead.referrer).hostname.replace(/^www\./, "");
  } catch {
    return lead.referrer;
  }
}

type Column = { key: string; header: string; width: number; group?: "distribution"; note?: string };

const columns: Column[] = [
  { key: "id", header: "Lead ID", width: 11, note: "Unique per lead. Use it to match rows when you paste a newer export under this one." },
  { key: "received", header: "Received (WIB)", width: 17 },
  { key: "age", header: "Age (days)", width: 10, note: "Days since the lead arrived. Red while still New after a day." },
  { key: "name", header: "Name", width: 24 },
  { key: "whatsapp", header: "WhatsApp", width: 19, note: "Click to open a WhatsApp chat." },
  { key: "programs", header: "Programs", width: 28 },
  { key: "counsellor", header: "Assigned counsellor", width: 22, group: "distribution", note: "Filled from the CMS when the lead was assigned there. Pick from the list to change it here; names come from the Counsellors sheet." },
  { key: "assignedOn", header: "Assigned on", width: 13, group: "distribution", note: "Press Ctrl+; (Cmd+; on Mac) for today's date." },
  { key: "status", header: "Status", width: 20, group: "distribution", note: "Update after every contact. Meanings are on the How to use sheet." },
  { key: "followUp", header: "Next follow-up", width: 14, group: "distribution", note: "Orange when the date has come and the lead is still open." },
  { key: "counsellorNotes", header: "Counsellor notes", width: 32, group: "distribution" },
  { key: "language", header: "Language", width: 10 },
  { key: "form", header: "Form", width: 16, note: "Contact page form, or the short form shown before opening WhatsApp." },
  { key: "channel", header: "Channel", width: 16 },
  { key: "source", header: "Source", width: 18 },
  { key: "medium", header: "Medium", width: 12 },
  { key: "campaign", header: "Campaign", width: 22 },
  { key: "adContent", header: "Ad content", width: 18 },
  { key: "keyword", header: "Keyword", width: 18 },
  { key: "firstCampaign", header: "First campaign", width: 22, note: "The first campaign this visitor came from, if different from the last." },
  { key: "landingPage", header: "Landing page", width: 26 },
  { key: "referrer", header: "Referrer", width: 26 },
  { key: "device", header: "Device", width: 10 },
  { key: "submissions", header: "Times submitted", width: 10, note: "More than 1: the same number sent the form again within a week. Shows interest." },
];

/** Column letter for a key, e.g. "status" -> "I". */
function col(key: string) {
  const index = columns.findIndex((column) => column.key === key);
  if (index < 0) throw new Error(`Unknown column ${key}`);
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

const lastRow = (count: number) => Math.max(count, 1) + 1 + BUFFER;

/** Whole-column range on the Leads sheet, sized to cover pasted rows too. */
const L = (key: string, rows: number) => `Leads!$${col(key)}$2:$${col(key)}$${lastRow(rows)}`;

export async function buildLeadsWorkbook(input: WorkbookInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Yanks and Brits CMS";
  workbook.created = input.generatedAt;
  workbook.calcProperties.fullCalcOnLoad = true;

  const programName = new Map(input.programs.map((program) => [program.slug, program.name]));
  const count = input.leads.length;
  const end = lastRow(count);

  // ---------- Leads ----------
  const sheet = workbook.addWorksheet("Leads", {
    views: [{ state: "frozen", xSplit: 4, ySplit: 1, activeCell: "G2" }],
    properties: { tabColor: { argb: blue } },
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  sheet.columns = columns.map((column) => ({ key: column.key, width: column.width }));
  // Column styles, set before any cell: Excel applies them to rows the team adds or pastes later too.
  const distributionFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.distribution } };
  for (const column of columns) {
    const target = sheet.getColumn(col(column.key));
    if (column.group) target.fill = distributionFill;
    if (column.key === "received") target.numFmt = "dd mmm yyyy hh:mm";
    if (column.key === "assignedOn" || column.key === "followUp") target.numFmt = "dd mmm yyyy";
    if (column.key === "age" || column.key === "submissions") target.alignment = { horizontal: "center" };
    if (["programs", "counsellorNotes"].includes(column.key)) target.alignment = { wrapText: true, vertical: "top" };
  }

  const header = sheet.getRow(1);
  columns.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: palette.headerText } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: column.group ? "FF142159" : palette.header } };
    cell.alignment = { vertical: "middle", wrapText: true };
    if (column.note) cell.note = { texts: [{ text: column.note }], margins: { insetmode: "auto" } };
  });
  header.height = 30;

  input.leads.forEach((lead, index) => {
    const r = index + 2;
    const row = sheet.getRow(r);
    const values: Record<string, ExcelJS.CellValue> = {
      id: lead.id.slice(0, 8).toUpperCase(),
      received: wib(lead.createdAt),
      age: { formula: `IF(${col("received")}${r}="","",INT(NOW()-${col("received")}${r}))` },
      name: lead.name,
      whatsapp: { text: formatWhatsapp(lead.whatsapp), hyperlink: `https://wa.me/${lead.whatsapp}` },
      programs: lead.programs.map((slug) => programName.get(slug) ?? slug).join(", "),
      counsellor: lead.counsellor?.name ?? null,
      assignedOn: lead.assignedAt ? wib(lead.assignedAt) : null,
      status: "New",
      language: lead.locale === "id" ? "Indonesian" : "English",
      form: lead.origin === "whatsapp" ? "WhatsApp popup" : "Contact page",
      channel: lead.channel,
      source: sourceOf(lead),
      medium: lead.utmMedium ?? "",
      campaign: lead.utmCampaign ?? "",
      adContent: lead.utmContent ?? "",
      keyword: lead.utmTerm ?? "",
      firstCampaign: lead.firstUtmCampaign && lead.firstUtmCampaign !== lead.utmCampaign ? lead.firstUtmCampaign : "",
      landingPage: lead.landingPage ?? "",
      referrer: lead.referrer ?? "",
      device: lead.device ? lead.device[0].toUpperCase() + lead.device.slice(1) : "",
      submissions: lead.submissions,
    };
    for (const [key, value] of Object.entries(values)) row.getCell(col(key)).value = value;
    row.getCell(col("whatsapp")).font = { color: { argb: blue }, underline: true };
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(count, 1) + 1, column: columns.length } };

  // Dropdowns and date checks, one rule per column range. (Per-cell rules trip an ExcelJS bug that writes
  // overlapping ranges, which makes Excel offer to "repair" the file.)
  const validations = (sheet as unknown as { dataValidations: { add: (range: string, rule: ExcelJS.DataValidation) => void } }).dataValidations;
  const span = (key: string) => `${col(key)}2:${col(key)}${end}`;
  validations.add(span("counsellor"), {
    type: "list",
    allowBlank: true,
    formulae: [`Counsellors!$A$2:$A$${COUNSELLOR_ROWS + 1}`],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Not on the counsellor list",
    error: "Add the name on the Counsellors sheet first, so workload counts stay right.",
  });
  validations.add(span("status"), {
    type: "list",
    allowBlank: true,
    formulae: [`Lists!$A$2:$A$${statuses.length + 1}`],
    showErrorMessage: true,
    errorTitle: "Pick a status",
    error: "Choose a status from the list so the summary can count it.",
  });
  for (const key of ["assignedOn", "followUp"]) {
    validations.add(span(key), {
      type: "date",
      operator: "greaterThan",
      allowBlank: true,
      formulae: [new Date(Date.UTC(2020, 0, 1))],
      showErrorMessage: true,
      errorTitle: "Enter a date",
      error: "Type a date, e.g. 15/10/2026, or press Ctrl+; for today.",
    });
  }

  const S = (r = 2) => `$${col("status")}${r}`;
  const openTest = closed.map((name) => `${S()}<>"${name}"`).join(",");
  sheet.addConditionalFormatting({
    ref: `A2:${col("submissions")}${end}`,
    rules: [
      // Lead ID seen twice: an overlapping paste.
      { type: "expression", priority: 1, formulae: [`AND($A2<>"",COUNTIF($A$2:$A$${end},$A2)>1)`], style: { font: { color: { argb: palette.redText }, bold: true } } },
    ],
  });
  sheet.addConditionalFormatting({
    ref: `${span("age")} ${span("name")}`,
    rules: [
      // Speed to lead: still New a day after it arrived.
      { type: "expression", priority: 2, formulae: [`AND($${col("name")}2<>"",${S()}="New",$${col("age")}2>=1)`], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: palette.red } }, font: { color: { argb: palette.redText }, bold: true } } },
    ],
  });
  sheet.addConditionalFormatting({
    ref: span("counsellor"),
    rules: [
      { type: "expression", priority: 3, formulae: [`AND($${col("name")}2<>"",$${col("counsellor")}2="")`], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: palette.amber } } } },
    ],
  });
  sheet.addConditionalFormatting({
    ref: span("followUp"),
    rules: [
      { type: "expression", priority: 4, formulae: [`AND($${col("followUp")}2<>"",$${col("followUp")}2<=TODAY(),${openTest})`], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFED7AA" } }, font: { color: { argb: palette.amberText }, bold: true } } },
    ],
  });
  const statusStyle = (fill: string, font: string) => ({ fill: { type: "pattern" as const, pattern: "solid" as const, bgColor: { argb: fill } }, font: { color: { argb: font } } });
  sheet.addConditionalFormatting({
    ref: span("status"),
    rules: [
      { type: "cellIs", operator: "equal", priority: 5, formulae: ['"Enrolled"'], style: statusStyle(palette.green, palette.greenText) },
      { type: "cellIs", operator: "equal", priority: 6, formulae: ['"Consultation booked"'], style: statusStyle(palette.sky, blue) },
      { type: "cellIs", operator: "equal", priority: 7, formulae: ['"Contacted"'], style: statusStyle("FFE9ECF6", blue) },
      { type: "cellIs", operator: "equal", priority: 8, formulae: ['"No response"'], style: statusStyle(palette.amber, palette.amberText) },
      { type: "cellIs", operator: "equal", priority: 9, formulae: ['"Not interested"'], style: statusStyle(palette.grey, palette.greyText) },
      { type: "cellIs", operator: "equal", priority: 10, formulae: ['"Invalid number"'], style: statusStyle(palette.grey, palette.greyText) },
    ],
  });

  // ---------- Counsellors ----------
  const team = workbook.addWorksheet("Counsellors", { views: [{ state: "frozen", ySplit: 1 }], properties: { tabColor: { argb: "FF142159" } } });
  const teamHeaders = ["Counsellor", "Assigned", "Open", "Contacted or later", "Consultations", "Enrolled", "Enrolment rate", "Follow-ups due", "Queue order"];
  team.columns = [{ width: 26 }, { width: 11 }, { width: 9 }, { width: 18 }, { width: 14 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 12 }];
  teamHeaders.forEach((text, index) => {
    const cell = team.getRow(1).getCell(index + 1);
    cell.value = text;
    cell.font = { bold: true, color: { argb: palette.headerText } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.header } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  team.getRow(1).height = 30;
  team.getCell("A1").note = { texts: [{ text: "Add or remove names here; the dropdown on the Leads sheet follows this list." }] };
  team.getCell("C1").note = { texts: [{ text: "Leads not yet Enrolled, Not interested, or Invalid number. Lower means more room." }] };
  team.getCell("I1").note = { texts: [{ text: "Helper for Next in line: open load, then list order breaks ties." }] };

  const C = L("counsellor", count);
  const ST = L("status", count);
  const FU = L("followUp", count);
  for (let i = 0; i < COUNSELLOR_ROWS; i++) {
    const r = i + 2;
    const row = team.getRow(r);
    row.getCell(1).value = input.counsellors[i] ?? null;
    const name = `$A${r}`;
    const blankGuard = (formula: string) => ({ formula: `IF(${name}="","",${formula})` });
    row.getCell(2).value = blankGuard(`COUNTIF(${C},${name})`);
    row.getCell(3).value = blankGuard(`COUNTIFS(${C},${name},${ST},"<>Enrolled",${ST},"<>Not interested",${ST},"<>Invalid number")`);
    row.getCell(4).value = blankGuard(`SUMPRODUCT((${C}=${name})*(${ST}<>"New")*(${ST}<>""))`);
    row.getCell(5).value = blankGuard(`COUNTIFS(${C},${name},${ST},"Consultation booked")+COUNTIFS(${C},${name},${ST},"Enrolled")`);
    row.getCell(6).value = blankGuard(`COUNTIFS(${C},${name},${ST},"Enrolled")`);
    row.getCell(7).value = blankGuard(`IFERROR(F${r}/B${r},0)`);
    row.getCell(7).numFmt = "0%";
    row.getCell(8).value = blankGuard(`COUNTIFS(${C},${name},${FU},"<="&TODAY(),${ST},"<>Enrolled",${ST},"<>Not interested",${ST},"<>Invalid number")`);
    row.getCell(9).value = { formula: `IF(${name}="",1E+9,C${r}+ROW()/1000)` };
    row.getCell(9).font = { color: { argb: "FFB0B3BA" } };
  }
  const firstTeam = 2;
  const lastTeam = COUNSELLOR_ROWS + 1;
  team.addConditionalFormatting({
    ref: `C${firstTeam}:C${lastTeam}`,
    rules: [{ type: "dataBar", priority: 1, cfvo: [{ type: "min" }, { type: "max" }], color: { argb: "FF7C8AC7" } } as ExcelJS.ConditionalFormattingRule],
  });
  team.addConditionalFormatting({
    ref: `H${firstTeam}:H${lastTeam}`,
    rules: [{ type: "cellIs", operator: "greaterThan", priority: 2, formulae: ["0"], style: { font: { color: { argb: palette.amberText }, bold: true } } }],
  });

  // Next in line + unassigned, beside the table.
  team.getColumn(11).width = 24;
  team.getColumn(12).width = 26;
  const callout = (r: number, label: string, formula: string, note: string) => {
    const labelCell = team.getCell(`K${r}`);
    labelCell.value = label;
    labelCell.font = { bold: true, color: { argb: ink } };
    const value = team.getCell(`L${r}`);
    value.value = { formula };
    value.font = { bold: true, size: 13, color: { argb: blue } };
    value.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.distribution } };
    team.getCell(`K${r + 1}`).value = note;
    team.getCell(`K${r + 1}`).font = { italic: true, size: 9, color: { argb: palette.greyText } };
  };
  callout(2, "Next in line", `IF(COUNTA(A${firstTeam}:A${lastTeam})=0,"Add counsellors in column A",INDEX(A${firstTeam}:A${lastTeam},MATCH(MIN(I${firstTeam}:I${lastTeam}),I${firstTeam}:I${lastTeam},0)))`, "Lowest open load; assign the next lead here.");
  callout(5, "Unassigned leads", `SUMPRODUCT((${L("name", count)}<>"")*(${C}=""))`, "Filter Assigned counsellor = (Blanks) on Leads.");
  callout(8, "New for over a day", `SUMPRODUCT((${L("name", count)}<>"")*(${ST}="New")*ISNUMBER(${L("age", count)})*(${L("age", count)}>=1))`, "Contact these first.");

  // ---------- Summary ----------
  const summary = workbook.addWorksheet("Summary", { properties: { tabColor: { argb: "FF7C8AC7" } } });
  summary.columns = [{ width: 30 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 14 }];
  // "Not blank" is written as COUNTA or a SUMPRODUCT comparison: COUNTIF's "<>" and "?*" differ between spreadsheet apps.
  const N = L("name", count);
  let r = 1;
  summary.getCell(`A${r}`).value = "Leads summary";
  summary.getCell(`A${r}`).font = { bold: true, size: 16, color: { argb: ink } };
  r += 1;
  summary.getCell(`A${r}`).value = `Live from the Leads sheet. Exported ${formatStamp(input.generatedAt)} WIB · ${input.scope}`;
  summary.getCell(`A${r}`).font = { italic: true, size: 9, color: { argb: palette.greyText } };
  r += 2;

  const kpis: [string, string, string?][] = [
    ["Leads", `COUNTA(${N})`],
    ["Unassigned", `SUMPRODUCT((${N}<>"")*(${C}=""))`],
    ["Still New", `SUMPRODUCT((${N}<>"")*(${ST}="New"))`],
    ["Contacted or later", `SUMPRODUCT((${N}<>"")*(${ST}<>"New")*(${ST}<>""))`],
    ["Contact rate", `IFERROR(B${r + 3}/B${r},0)`, "0%"],
    ["Consultations booked or enrolled", `COUNTIF(${ST},"Consultation booked")+COUNTIF(${ST},"Enrolled")`],
    ["Enrolled", `COUNTIF(${ST},"Enrolled")`],
    ["Lead to enrolment", `IFERROR(B${r + 6}/B${r},0)`, "0%"],
  ];
  for (const [label, formula, fmt] of kpis) {
    summary.getCell(`A${r}`).value = label;
    const cell = summary.getCell(`B${r}`);
    cell.value = { formula };
    cell.font = { bold: true, color: { argb: blue } };
    if (fmt) cell.numFmt = fmt;
    r += 1;
  }
  r += 1;

  const breakdown = (title: string, rows: string[], match: (value: string) => string) => {
    const head = summary.getRow(r);
    [title, "Leads", "Consultations", "Enrolled", "Enrolment rate"].forEach((text, index) => {
      const cell = head.getCell(index + 1);
      cell.value = text;
      cell.font = { bold: true, color: { argb: palette.headerText } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.header } };
    });
    r += 1;
    for (const value of rows) {
      const criteria = match(value);
      summary.getCell(`A${r}`).value = value;
      summary.getCell(`B${r}`).value = { formula: `COUNTIFS(${criteria})` };
      summary.getCell(`C${r}`).value = { formula: `COUNTIFS(${criteria},${ST},"Consultation booked")+COUNTIFS(${criteria},${ST},"Enrolled")` };
      summary.getCell(`D${r}`).value = { formula: `COUNTIFS(${criteria},${ST},"Enrolled")` };
      summary.getCell(`E${r}`).value = { formula: `IFERROR(D${r}/B${r},0)` };
      summary.getCell(`E${r}`).numFmt = "0%";
      r += 1;
    }
    r += 1;
  };
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  breakdown("Channel", [...channels], (value) => `${L("channel", count)},${quote(value)}`);
  const campaigns = [...new Set(input.leads.map((lead) => lead.utmCampaign).filter((value): value is string => Boolean(value)))].sort();
  if (campaigns.length) breakdown("Campaign", campaigns.slice(0, 50), (value) => `${L("campaign", count)},${quote(value)}`);
  // Programs share a cell, so match the name anywhere in it.
  breakdown("Program", input.programs.map((program) => program.name), (value) => `${L("programs", count)},${quote(`*${value}*`)}`);
  breakdown("Form", ["Contact page", "WhatsApp popup"], (value) => `${L("form", count)},${quote(value)}`);

  // ---------- Lists (dropdown sources) ----------
  const lists = workbook.addWorksheet("Lists", { state: "hidden" });
  lists.getCell("A1").value = "Status";
  statuses.forEach((status, index) => (lists.getCell(`A${index + 2}`).value = status));

  // ---------- How to use ----------
  const guide = workbook.addWorksheet("How to use", { properties: { tabColor: { argb: "FF929499" } } });
  guide.getColumn(1).width = 26;
  guide.getColumn(2).width = 92;
  const lines: [string, string, ("title" | "head" | "body")?][] = [
    ["Leads workbook", "", "title"],
    ["Exported", `${formatStamp(input.generatedAt)} WIB by ${input.generatedBy}`],
    ["Includes", `${count} lead${count === 1 ? "" : "s"} · ${input.scope}`],
    ["", ""],
    ["Daily routine", "", "head"],
    ["1. Assign in the CMS", "Assign leads in CMS > Leads: the counsellor is alerted on WhatsApp and this column fills in on the next export. For leads still blank here, Counsellors > Next in line suggests who has room."],
    ["2. Contact fast", "Reply within the hour in office hours. Leads answered the same day convert far better. Red Age means a lead is still New after a day."],
    ["3. Log every touch", "After each call or chat, set Status and a Next follow-up date. Orange follow-up dates are due today or overdue."],
    ["4. Review weekly", "Use Summary for channel, campaign, and program results, and Counsellors for workload and follow-ups due."],
    ["", ""],
    ["Statuses", "", "head"],
    ["New", "Not contacted yet."],
    ["Contacted", "Reached on WhatsApp or by phone; conversation started."],
    ["Consultation booked", "A free consultation is scheduled or done."],
    ["Enrolled", "Signed up for a program. Closed."],
    ["No response", "Tried at least three times over a week with no reply. Still open: try again later."],
    ["Not interested", "Declined, or chose another provider. Closed."],
    ["Invalid number", "The number is wrong or not on WhatsApp. Closed."],
    ["", ""],
    ["Colours", "", "head"],
    ["Red Age and name", "Still New one day or more after arriving."],
    ["Amber counsellor cell", "No counsellor assigned yet."],
    ["Orange follow-up", "Follow-up date has come and the lead is still open."],
    ["Red Lead ID", "The same lead appears twice, usually from pasting an export over an older one."],
    ["", ""],
    ["Adding newer leads", "", "head"],
    ["Keep one working file", "This file is a snapshot; status, follow-ups, and notes kept here do not go back to the CMS. To add new leads, export a short range (e.g. Last 7 days), copy the rows whose Lead ID is not already here, and paste them under the last row. Dropdowns, colours, and totals cover the new rows."],
    ["", ""],
    ["Personal data", "", "head"],
    ["Handle with care", "Names and WhatsApp numbers are personal data under Indonesia's Personal Data Protection Law (UU PDP). Share this file only with the admissions team, never by public link, and delete old copies when you no longer need them. To remove someone completely, ask an admin to delete the lead in the CMS too."],
  ];
  lines.forEach(([label, text, kind], index) => {
    const row = guide.getRow(index + 1);
    row.getCell(1).value = label;
    row.getCell(2).value = text;
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
    row.getCell(1).alignment = { vertical: "top" };
    if (kind === "title") row.getCell(1).font = { bold: true, size: 16, color: { argb: ink } };
    else if (kind === "head") {
      row.getCell(1).font = { bold: true, color: { argb: blue } };
      row.getCell(1).border = { bottom: { style: "thin", color: { argb: "FFD3D8EC" } } };
      row.getCell(2).border = { bottom: { style: "thin", color: { argb: "FFD3D8EC" } } };
    } else row.getCell(1).font = { bold: true, color: { argb: ink } };
  });

  workbook.views = [{ x: 0, y: 0, width: 28000, height: 16000, firstSheet: 0, activeTab: 0, visibility: "visible" }];
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function formatStamp(date: Date) {
  const d = wib(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
