import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TutorEditor } from "@/components/admin/person-editors";
import { requireUser } from "@/lib/auth/session";
import { getTutorForEdit } from "@/lib/cms/people";
import { listSiteImages } from "@/lib/cms/programs";
import { getPrograms } from "@/lib/programs";
import { emptyTutorText, tutorContentSchema } from "@/lib/people/types";

export const metadata: Metadata = { title: "Edit tutor" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [row, images, programs] = await Promise.all([getTutorForEdit(id), listSiteImages(), getPrograms("en")]);
  if (!row) notFound();
  const content = tutorContentSchema.safeParse(row.content);
  return (
    <TutorEditor
      key={row.id}
      images={images}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      canDelete={user.role === "admin"}
      initial={{
        id: row.id,
        slug: row.slug,
        name: row.name,
        photo: row.photo ?? "",
        published: row.published,
        featured: row.featured,
        programs: row.programs,
        languages: row.languages,
        content: content.success ? content.data : { en: emptyTutorText },
        updatedAt: row.updatedAt.toISOString(),
      }}
    />
  );
}
