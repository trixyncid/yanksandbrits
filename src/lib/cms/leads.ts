import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { channels } from "@/lib/leads/channel";
import { exportLimit, originLabels, pageSize, rangeStart, UNASSIGNED, type FacetKey, type LeadFilters } from "@/lib/leads/filters";

const DAY = 24 * 60 * 60 * 1000;

function where(filters: LeadFilters, skip?: FacetKey): Prisma.LeadWhereInput {
  const and: Prisma.LeadWhereInput[] = [];
  const since = rangeStart(filters.range);
  if (since) and.push({ createdAt: { gte: since } });
  if (skip !== "program" && filters.program.length) and.push({ programs: { hasSome: filters.program } });
  if (skip !== "channel" && filters.channel.length) and.push({ channel: { in: filters.channel } });
  if (skip !== "origin" && filters.origin.length) and.push({ origin: { in: filters.origin } });
  if (skip !== "counsellor" && filters.counsellor.length) {
    const ids = filters.counsellor.filter((id) => id !== UNASSIGNED);
    and.push({ OR: [...(ids.length ? [{ counsellorId: { in: ids } }] : []), ...(filters.counsellor.includes(UNASSIGNED) ? [{ counsellorId: null }] : [])] });
  }
  if (filters.q) {
    // People type numbers as 0812…, +62 812…, or 812…; stored numbers are 62812…, so match on the part after the prefix.
    const digits = filters.q.replace(/\D/g, "").replace(/^(62|0)/, "");
    const phone = digits.length >= 4 ? digits : "";
    and.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { utmCampaign: { contains: filters.q, mode: "insensitive" } },
        ...(phone ? [{ whatsapp: { contains: phone } }] : []),
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

const orderBy: Record<LeadFilters["sort"], Prisma.LeadOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  name: [{ name: "asc" }, { createdAt: "desc" }],
  "name-desc": [{ name: "desc" }, { createdAt: "desc" }],
};

const rowSelect = { counsellor: { select: { id: true, name: true } } } satisfies Prisma.LeadInclude;

export async function listLeads(filters: LeadFilters) {
  const filter = where(filters);
  const [rows, total, unassigned] = await Promise.all([
    db.lead.findMany({ where: filter, orderBy: orderBy[filters.sort], skip: (filters.page - 1) * pageSize, take: pageSize, include: rowSelect }),
    db.lead.count({ where: filter }),
    db.lead.count({ where: { AND: [filter, { counsellorId: null }] } }),
  ]);
  return { rows, total, unassigned, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export type FacetOption = { value: string; label: string; count: number };

/**
 * The values each column filter offers, counted under every other active filter (as Excel does), so a list
 * never offers a value that would show nothing. Ticked values stay listed even at zero, so they can be unticked.
 */
export async function leadFacets(filters: LeadFilters, programs: { slug: string; name: string }[], counsellors: { id: string; name: string }[]): Promise<Record<FacetKey, FacetOption[]>> {
  const [programRows, channelRows, originRows, counsellorRows] = await Promise.all([
    // Programs are an array per lead, so they are counted here rather than grouped in the database.
    db.lead.findMany({ where: where(filters, "program"), select: { programs: true }, take: exportLimit }),
    db.lead.groupBy({ by: ["channel"], where: where(filters, "channel"), _count: { _all: true } }),
    db.lead.groupBy({ by: ["origin"], where: where(filters, "origin"), _count: { _all: true } }),
    db.lead.groupBy({ by: ["counsellorId"], where: where(filters, "counsellor"), _count: { _all: true } }),
  ]);

  const programCounts = new Map<string, number>();
  for (const row of programRows) for (const slug of row.programs) programCounts.set(slug, (programCounts.get(slug) ?? 0) + 1);
  const programName = new Map(programs.map((program) => [program.slug, program.name]));
  const counsellorName = new Map(counsellors.map((counsellor) => [counsellor.id, counsellor.name]));

  const build = (key: FacetKey, counts: Map<string, number>, label: (value: string) => string, order: string[] = []) => {
    for (const value of filters[key]) if (!counts.has(value)) counts.set(value, 0);
    const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: label(value), count }))
      .sort((a, b) => rank(a.value) - rank(b.value) || b.count - a.count || a.label.localeCompare(b.label));
  };

  return {
    program: build("program", programCounts, (slug) => programName.get(slug) ?? slug, programs.map((program) => program.slug)),
    channel: build("channel", new Map(channelRows.map((row) => [row.channel, row._count._all])), (value) => value, [...channels]),
    origin: build("origin", new Map(originRows.map((row) => [row.origin, row._count._all])), (value) => originLabels[value as keyof typeof originLabels] ?? value, ["contact", "whatsapp"]),
    counsellor: build(
      "counsellor",
      new Map(counsellorRows.map((row) => [row.counsellorId ?? UNASSIGNED, row._count._all])),
      (value) => (value === UNASSIGNED ? "Unassigned" : (counsellorName.get(value) ?? "Removed counsellor")),
      [UNASSIGNED, ...counsellors.map((counsellor) => counsellor.id)],
    ),
  };
}

export const leadsForExport = (filters: LeadFilters) => db.lead.findMany({ where: where(filters), orderBy: orderBy[filters.sort], take: exportLimit, include: rowSelect });

export const getLead = (id: string) =>
  db.lead.findUnique({ where: { id }, include: { counsellor: { select: { id: true, name: true, whatsapp: true } }, assignedBy: { select: { name: true } } } });

/** Counsellors to assign to, with how many leads each was given in the last 30 days (a rough workload). */
export async function assignableCounsellors() {
  const [counsellors, load] = await Promise.all([
    db.counsellor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, onDesk: true, whatsapp: true } }),
    db.lead.groupBy({ by: ["counsellorId"], where: { counsellorId: { not: null }, assignedAt: { gte: new Date(Date.now() - 30 * DAY) } }, _count: { _all: true } }),
  ]);
  const recent = new Map(load.map((row) => [row.counsellorId, row._count._all]));
  return counsellors.map(({ whatsapp, ...counsellor }) => ({ ...counsellor, hasWhatsapp: Boolean(whatsapp), recent: recent.get(counsellor.id) ?? 0 }));
}

export async function deleteLead(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete a lead." };
  const deleted = await db.lead.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: "This lead no longer exists." };
}
