import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { getTestimonialForEdit } from "@/lib/cms/testimonials";

export const metadata: Metadata = { title: "Edit testimonial" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [row, images] = await Promise.all([getTestimonialForEdit(id), listSiteImages()]);
  if (!row) notFound();
  return (
    <TestimonialEditor
      key={row.id}
      images={images}
      canDelete={user.role === "admin"}
      initial={{ id: row.id, quote: row.quote, name: row.name, role: row.role, photo: row.photo ?? "", published: row.published, updatedAt: row.updatedAt.toISOString() }}
    />
  );
}
