import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramEditor } from "@/components/admin/program-editor";
import { requireUser } from "@/lib/auth/session";
import { getProgramForEdit, listSiteImages } from "@/lib/cms/programs";
import { parseModules } from "@/lib/programs";

export const metadata: Metadata = { title: "Edit program" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [program, images] = await Promise.all([getProgramForEdit(id), listSiteImages()]);
  if (!program) notFound();

  return (
    <ProgramEditor
      key={program.id}
      images={images}
      canDelete={user.role === "admin"}
      initial={{
        id: program.id,
        locale: program.locale,
        slug: program.slug,
        published: program.published,
        category: program.category,
        name: program.name,
        tag: program.tag,
        headline: program.headline,
        summary: program.summary,
        targetAudience: program.targetAudience,
        format: program.format,
        formatLabel: program.formatLabel,
        duration: program.duration,
        schedule: program.schedule,
        level: program.level,
        outcomes: program.outcomes,
        syllabus: parseModules(program.syllabus),
        image: program.image ?? "",
        imageAlt: program.imageAlt ?? "",
        seoTitle: program.seoTitle ?? "",
        seoDescription: program.seoDescription ?? "",
        updatedAt: program.updatedAt.toISOString(),
      }}
    />
  );
}
