import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DeleteLeadButton } from "@/components/admin/delete-lead-button";
import { PageHeader, panel, primaryAction } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/cms/format";
import { assignableCounsellors, getLead } from "@/lib/cms/leads";
import { leadAlert, manualAlertHref } from "@/lib/leads/alert";
import { LeadAssignment, type AssignmentState } from "@/components/admin/leads/lead-assignment";
import { getPrograms } from "@/lib/programs";
import { cn } from "@/lib/utils";
import { formatWhatsapp } from "@/lib/validation/phone";

export const metadata: Metadata = { title: "Lead" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;


export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  // Ids are UUIDs; anything else cannot be a lead.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [lead, programs, counsellors] = await Promise.all([getLead(id), getPrograms("en"), assignableCounsellors()]);
  if (!lead) notFound();
  const programName = new Map(programs.map((program) => [program.slug, program.name]));
  const assignment: AssignmentState = {
    leadId: lead.id,
    counsellor: lead.counsellor ? { id: lead.counsellor.id, name: lead.counsellor.name, hasWhatsapp: Boolean(lead.counsellor.whatsapp) } : null,
    assigned: lead.assignedAt ? `Assigned ${formatDateTime(lead.assignedAt)}${lead.assignedBy ? ` by ${lead.assignedBy.name}` : ""}` : null,
    alert: !lead.counsellor
      ? null
      : lead.notifiedAt
        ? { state: "sent", detail: `Alerted on WhatsApp ${formatDateTime(lead.notifiedAt)}.` }
        : { state: lead.notifyError ? "failed" : "pending", detail: lead.notifyError ?? "No alert recorded yet." },
    manualHref: lead.counsellor?.whatsapp
      ? manualAlertHref(
          lead.counsellor.whatsapp,
          leadAlert({
            counsellor: lead.counsellor.name,
            leads: [{ name: lead.name, whatsapp: lead.whatsapp, channel: lead.channel, programs: lead.programs.map((slug) => programName.get(slug) ?? slug) }],
            assignedBy: user.name,
          }),
        )
      : null,
  };
  const firstDifferent = lead.firstUtmCampaign && lead.firstUtmCampaign !== lead.utmCampaign;

  return (
    <div className="mx-auto max-w-[72rem]">
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cms-ink/60 hover:text-cms-blue">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All leads
      </Link>
      <PageHeader
        eyebrow={`Lead · ${lead.id.slice(0, 8).toUpperCase()}`}
        title={lead.name}
        description={`Received ${formatDateTime(lead.createdAt)} WIB from the ${lead.origin === "whatsapp" ? "WhatsApp popup" : "Contact page"}.${lead.submissions > 1 ? ` Sent ${lead.submissions} times; the latest on ${formatDateTime(lead.updatedAt)}.` : ""}`}
        actions={
          <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className={primaryAction}>
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-5">
          <Card title="Request">
            <Row label="WhatsApp">
              <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-cms-blue tabular-nums hover:underline">
                {formatWhatsapp(lead.whatsapp)}
              </a>
            </Row>
            <Row label="Programs">
              <span className="flex flex-wrap gap-1.5">
                {lead.programs.map((slug) => (
                  <span key={slug} className="rounded-full bg-cms-blue-10 px-2.5 py-0.5 text-xs font-semibold text-cms-blue">
                    {programName.get(slug) ?? slug}
                  </span>
                ))}
              </span>
            </Row>
            <Row label="Language">{lead.locale === "id" ? "Indonesian" : "English"}</Row>
          </Card>
        </div>

        <div className="grid content-start gap-5">
          <section className={cn(panel, "p-5 sm:p-6")}>
            <h2 className="mb-3 text-base font-semibold">Counsellor</h2>
            <LeadAssignment key={`${lead.counsellorId}-${lead.notifiedAt?.getTime()}-${lead.notifyError}`} state={assignment} counsellors={counsellors} />
          </section>

          <Card title="Where they came from">
            <Row label="Channel">
              <span className="font-semibold">{lead.channel}</span>
            </Row>
            <Row label="Source / medium">{lead.utmSource || lead.utmMedium ? `${lead.utmSource ?? "—"} / ${lead.utmMedium ?? "—"}` : <Empty />}</Row>
            <Row label="Campaign">{lead.utmCampaign ?? <Empty />}</Row>
            {lead.utmContent ? <Row label="Ad content">{lead.utmContent}</Row> : null}
            {lead.utmTerm ? <Row label="Keyword">{lead.utmTerm}</Row> : null}
            {firstDifferent ? <Row label="First campaign">{lead.firstUtmCampaign}</Row> : null}
            <Row label="Landing page">{lead.landingPage ? <span className="break-all">{lead.landingPage}</span> : <Empty />}</Row>
            <Row label="Referrer">{lead.referrer ? <span className="break-all">{lead.referrer}</span> : <Empty text="Direct or unknown" />}</Row>
            <Row label="Device">{lead.device ? lead.device[0].toUpperCase() + lead.device.slice(1) : <Empty />}</Row>
          </Card>

          {user.role === "admin" ? (
            <section className={cn(panel, "p-5")}>
              <h2 className="text-sm font-semibold">Erase this lead</h2>
              <p className="mt-1 mb-4 text-sm leading-6 text-cms-ink/60">For data deletion requests under UU PDP. Admins only.</p>
              <DeleteLeadButton id={lead.id} name={lead.name} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(panel, "p-5 sm:p-6")}>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <dl className="divide-y divide-cms-gray-25/70">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-cms-ink/55">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function Empty({ text = "Not given" }: { text?: string }) {
  return <span className="text-cms-ink/40">{text}</span>;
}
