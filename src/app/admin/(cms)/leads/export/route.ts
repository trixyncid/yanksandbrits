import { getCurrentUser } from "@/lib/auth/session";
import { leadsForExport } from "@/lib/cms/leads";
import { describeLeadFilters, parseLeadFilters } from "@/lib/leads/filters";
import { db } from "@/lib/db";
import { buildLeadsWorkbook } from "@/lib/leads/workbook";
import { getPrograms } from "@/lib/programs";

// Downloads the leads matching the Leads page filters as a distribution workbook.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });

  const filters = parseLeadFilters(Object.fromEntries(new URL(request.url).searchParams));
  const [leads, programs, counsellors] = await Promise.all([
    leadsForExport(filters),
    getPrograms("en"),
    db.counsellor.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  const generatedAt = new Date();
  const file = await buildLeadsWorkbook({
    leads,
    programs: programs.map(({ slug, name }) => ({ slug, name })),
    counsellors: counsellors.map((counsellor) => counsellor.name),
    generatedAt,
    generatedBy: user.email,
    scope: describeLeadFilters(filters, programs, counsellors),
  });

  // Personal data left the system: keep a trail of who exported what.
  console.info("[leads] Export", { by: user.email, rows: leads.length, filters: { ...filters, page: undefined } });

  const stamp = new Date(generatedAt.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="yanks-and-brits-leads-${stamp}.xlsx"`,
      "cache-control": "private, no-store",
    },
  });
}
