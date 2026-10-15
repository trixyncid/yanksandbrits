import type { Metadata } from "next";
import { TutorEditor } from "@/components/admin/person-editors";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { getPrograms } from "@/lib/programs";
import { emptyTutorText } from "@/lib/people/types";

export const metadata: Metadata = { title: "New tutor" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewTutorPage() {
  const user = await requireUser();
  const [images, programs] = await Promise.all([listSiteImages(), getPrograms("en")]);
  return (
    <TutorEditor
      images={images}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      canDelete={user.role === "admin"}
      initial={{ id: null, slug: "", name: "", photo: "", published: false, featured: false, programs: [], languages: [], content: { en: emptyTutorText }, updatedAt: null }}
    />
  );
}
