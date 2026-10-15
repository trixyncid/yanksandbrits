import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpoEditor } from "@/components/admin/expo-editor";
import { requireUser } from "@/lib/auth/session";
import { getExpoForEdit } from "@/lib/cms/expos";
import { listSiteImages } from "@/lib/cms/programs";

export const metadata: Metadata = { title: "Edit expo" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditExpoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [row, images] = await Promise.all([getExpoForEdit(id), listSiteImages()]);
  if (!row) notFound();
  return (
    <ExpoEditor
      key={row.id}
      images={images}
      canDelete={user.role === "admin"}
      initial={{
        id: row.id,
        slug: row.slug,
        name: row.name,
        summary: row.summary,
        audience: row.audience,
        covers: row.covers,
        image: row.image ?? "",
        imageAlt: row.imageAlt ?? "",
        startsAt: row.startsAt?.toISOString() ?? null,
        endsAt: row.endsAt?.toISOString() ?? null,
        venue: row.venue,
        city: row.city,
        registerUrl: row.registerUrl ?? "",
        published: row.published,
        updatedAt: row.updatedAt.toISOString(),
      }}
    />
  );
}
