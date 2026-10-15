// Lead list filters as they live in the URL. Shared by the CMS pages, the export, and the browser-side table.

import { channels } from "./channel";

const DAY = 24 * 60 * 60 * 1000;

export const leadRanges = ["7", "30", "90", "all"] as const;
export const leadSorts = ["newest", "oldest", "name", "name-desc"] as const;
export const pageSize = 50;
// The export is a working file for the team, not an archive; this keeps it fast to open in Excel.
export const exportLimit = 10_000;
/** Counsellor filter value for leads nobody has yet. */
export const UNASSIGNED = "none";

export type LeadFilters = {
  q: string;
  range: (typeof leadRanges)[number];
  // Column filters, Excel style: a lead shows when its value is one of the ticked ones. Empty means all.
  program: string[];
  channel: string[];
  origin: ("contact" | "whatsapp")[];
  counsellor: string[];
  sort: (typeof leadSorts)[number];
  page: number;
};

/** The column filters, in the order the table shows them. */
export const facetKeys = ["program", "channel", "origin", "counsellor"] as const;
export type FacetKey = (typeof facetKeys)[number];

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
// Multi-select values travel comma-separated: ?channel=Paid+social,Organic+search
const many = (value: string | string[] | undefined, valid: (item: string) => boolean) =>
  [...new Set(one(value).split(",").map((item) => item.trim()).filter(Boolean))].filter(valid).slice(0, 40);

/** Reads filters from the URL, dropping anything unexpected. */
export function parseLeadFilters(params: Params): LeadFilters {
  const range = one(params.range);
  const sort = one(params.sort);
  return {
    q: one(params.q).slice(0, 80),
    range: (leadRanges as readonly string[]).includes(range) ? (range as LeadFilters["range"]) : "30",
    program: many(params.program, (item) => /^[a-z0-9-]{1,80}$/.test(item)),
    channel: many(params.channel, (item) => (channels as readonly string[]).includes(item)),
    origin: many(params.origin, (item) => item === "contact" || item === "whatsapp") as LeadFilters["origin"],
    counsellor: many(params.counsellor, (item) => item === UNASSIGNED || /^[a-z0-9]{8,40}$/i.test(item)),
    sort: (leadSorts as readonly string[]).includes(sort) ? (sort as LeadFilters["sort"]) : "newest",
    page: Math.max(1, Math.min(1000, Number.parseInt(one(params.page), 10) || 1)),
  };
}

/** The same filters as a query string, for links that keep them (export, pagination, column filters). */
export function filtersQuery(filters: LeadFilters, overrides: Partial<LeadFilters> = {}) {
  const merged = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (merged.q) query.set("q", merged.q);
  if (merged.range !== "30") query.set("range", merged.range);
  for (const key of facetKeys) if (merged[key].length) query.set(key, merged[key].join(","));
  if (merged.sort !== "newest") query.set("sort", merged.sort);
  if (merged.page > 1) query.set("page", String(merged.page));
  const text = query.toString();
  return text ? `?${text}` : "";
}

const rangeLabels = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days", all: "All time" } as const;
export const originLabels = { contact: "Contact page", whatsapp: "WhatsApp popup" } as const;

/** The filters in words, e.g. "Last 30 days · IELTS · Paid social · Unassigned". */
export function describeLeadFilters(filters: LeadFilters, programs: { slug: string; name: string }[], counsellors: { id: string; name: string }[]) {
  const parts: string[] = [rangeLabels[filters.range]];
  if (filters.program.length) parts.push(filters.program.map((slug) => programs.find((program) => program.slug === slug)?.name ?? slug).join(" or "));
  if (filters.channel.length) parts.push(filters.channel.join(" or "));
  if (filters.origin.length) parts.push(filters.origin.map((origin) => originLabels[origin]).join(" or "));
  if (filters.counsellor.length) parts.push(filters.counsellor.map((id) => (id === UNASSIGNED ? "Unassigned" : (counsellors.find((c) => c.id === id)?.name ?? "Removed counsellor"))).join(" or "));
  if (filters.q) parts.push(`matching "${filters.q}"`);
  return parts.join(" · ");
}

/** Leads received within the date range, as a start time. */
export const rangeStart = (range: LeadFilters["range"]) => (range === "all" ? null : new Date(Date.now() - Number(range) * DAY));
