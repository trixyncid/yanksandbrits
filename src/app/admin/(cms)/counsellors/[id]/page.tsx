import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CounsellorEditor } from "@/components/admin/person-editors";
import { requireUser } from "@/lib/auth/session";
import { getCounsellorForEdit } from "@/lib/cms/people";
import { listSiteImages } from "@/lib/cms/programs";
import { formatWhatsapp } from "@/lib/validation/phone";
import { counsellorContentSchema, emptyCounsellorText } from "@/lib/people/types";

export const metadata: Metadata = { title: "Edit counsellor" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditCounsellorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [row, images] = await Promise.all([getCounsellorForEdit(id), listSiteImages()]);
  if (!row) notFound();
  const content = counsellorContentSchema.safeParse(row.content);
  return (
    <CounsellorEditor
      key={row.id}
      images={images}
      canDelete={user.role === "admin"}
      initial={{
        id: row.id,
        slug: row.slug,
        name: row.name,
        photo: row.photo ?? "",
        published: row.published,
        onDesk: row.onDesk,
        whatsapp: row.whatsapp ? formatWhatsapp(row.whatsapp) : "",
        content: content.success ? content.data : { en: emptyCounsellorText },
        updatedAt: row.updatedAt.toISOString(),
      }}
    />
  );
}
