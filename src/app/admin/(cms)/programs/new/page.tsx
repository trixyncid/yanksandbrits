import type { Metadata } from "next";
import { ProgramEditor } from "@/components/admin/program-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";

export const metadata: Metadata = { title: "New program" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewProgramPage() {
  const user = await requireUser();
  const images = await listSiteImages();

  return (
    <ProgramEditor
      images={images}
      canDelete={user.role === "admin"}
      initial={{
        id: null,
        locale: "en",
        slug: "",
        published: false,
        category: "language",
        name: "",
        tag: "",
        headline: "",
        summary: "",
        targetAudience: "",
        format: "hybrid",
        formatLabel: "",
        duration: "",
        schedule: "",
        level: "",
        outcomes: [""],
        syllabus: [{ title: "", body: "" }],
        image: "",
        imageAlt: "",
        seoTitle: "",
        seoDescription: "",
        updatedAt: null,
      }}
    />
  );
}
