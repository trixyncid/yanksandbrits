import type { Metadata } from "next";
import { HomeEditor } from "@/components/admin/home-editor";
import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { getHomeContentForEdit } from "@/lib/home";

export const metadata: Metadata = { title: "Homepage" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function HomepagePage() {
  await requireUser();
  const [{ content, updatedAt }, images] = await Promise.all([getHomeContentForEdit(), listSiteImages()]);
  return (
    <>
      <PageHeader eyebrow="Content" title="Homepage" description="Every headline, paragraph, photo, and figure on the home page. Programs, testimonials, articles, and ads have their own sections." />
      <HomeEditor initial={content} updatedAt={updatedAt} images={images} />
    </>
  );
}
