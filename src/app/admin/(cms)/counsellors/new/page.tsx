import type { Metadata } from "next";
import { CounsellorEditor } from "@/components/admin/person-editors";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { emptyCounsellorText } from "@/lib/people/types";

export const metadata: Metadata = { title: "New counsellor" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewCounsellorPage() {
  const user = await requireUser();
  const images = await listSiteImages();
  return (
    <CounsellorEditor
      images={images}
      canDelete={user.role === "admin"}
      initial={{ id: null, slug: "", name: "", photo: "", published: false, onDesk: true, whatsapp: "", content: { en: emptyCounsellorText }, updatedAt: null }}
    />
  );
}
