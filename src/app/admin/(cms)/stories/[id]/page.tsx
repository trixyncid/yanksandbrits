import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryEditor } from "@/components/admin/story-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { getStoryForEdit } from "@/lib/cms/stories";
import { listCountries } from "@/lib/countries";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "Edit story" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [row, images, programs] = await Promise.all([getStoryForEdit(id), listSiteImages(), getPrograms("en")]);
  if (!row) notFound();
  const { createdAt: _createdAt, sortOrder: _sortOrder, ...story } = row;
  return (
    <StoryEditor
      key={row.id}
      images={images}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      countries={listCountries()}
      canDelete={user.role === "admin"}
      initial={{ ...story, photo: row.photo ?? "", photoAlt: row.photoAlt ?? "", updatedAt: row.updatedAt.toISOString() }}
    />
  );
}
