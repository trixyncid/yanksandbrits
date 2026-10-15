import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, primaryAction } from "@/components/admin/page-header";
import { PeopleList } from "@/components/admin/people-list";
import { requireUser } from "@/lib/auth/session";
import { listTutors } from "@/lib/cms/people";
import { tutorContentSchema } from "@/lib/people/types";

export const metadata: Metadata = { title: "Tutors" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function TutorsPage() {
  const user = await requireUser();
  const rows = await listTutors();
  return (
    <div className="mx-auto max-w-[100rem]">
      <PageHeader
        eyebrow="People"
        title="Tutors"
        description="Featured tutors are listed first on the site, then this order."
        actions={
          <Link href="/admin/tutors/new" className={primaryAction}>
            <UserPlus className="size-4" aria-hidden="true" />
            New tutor
          </Link>
        }
      />
      <PeopleList
        kind="tutor"
        badgeLabel="Featured"
        badgeOn="Featured"
        canDelete={user.role === "admin"}
        rows={rows.map((row) => {
          const content = tutorContentSchema.safeParse(row.content);
          return { ...row, role: content.success ? content.data.en.role : "", badge: row.featured ? "Featured" : null };
        })}
        empty={
          <>
            <p className="font-semibold">No tutors yet</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-sm leading-6 text-cms-ink/60">Until a tutor is published, the Tutors page shows its “coming soon” gallery.</p>
          </>
        }
      />
    </div>
  );
}
