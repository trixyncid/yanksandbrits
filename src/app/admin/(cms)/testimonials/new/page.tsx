import type { Metadata } from "next";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";

export const metadata: Metadata = { title: "New testimonial" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewTestimonialPage() {
  const user = await requireUser();
  const images = await listSiteImages();
  return <TestimonialEditor images={images} canDelete={user.role === "admin"} initial={{ id: null, quote: "", name: "", role: "", photo: "", published: false, updatedAt: null }} />;
}
