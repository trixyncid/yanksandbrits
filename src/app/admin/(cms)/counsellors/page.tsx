import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, primaryAction } from "@/components/admin/page-header";
import { PeopleList } from "@/components/admin/people-list";
import { requireUser } from "@/lib/auth/session";
import { listCounsellors } from "@/lib/cms/people";
import { counsellorContentSchema } from "@/lib/people/types";

export const metadata: Metadata = { title: "Counsellors" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function CounsellorsPage() {
  const user = await requireUser();
  const rows = await listCounsellors();
  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="People"
        title="Counsellors"
        description="Shown on the Counselling page in this order."
        actions={
          <Link href="/admin/counsellors/new" className={primaryAction}>
            <UserPlus className="size-4" aria-hidden="true" />
            New counsellor
          </Link>
        }
      />
      <PeopleList
        kind="counsellor"
        badgeLabel="Availability"
        badgeOn="On desk"
        canDelete={user.role === "admin"}
        rows={rows.map((row) => {
          const content = counsellorContentSchema.safeParse(row.content);
          return { ...row, role: content.success ? content.data.en.role : "", badge: row.onDesk ? "On desk" : "Away" };
        })}
        empty={
          <>
            <p className="font-semibold">No counsellors in the CMS yet</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">
              The Counselling page leaves the team section out until you publish one.
            </p>
          </>
        }
      />
    </div>
  );
}
