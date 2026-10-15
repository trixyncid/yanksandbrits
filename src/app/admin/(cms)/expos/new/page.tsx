import type { Metadata } from "next";
import { ExpoEditor } from "@/components/admin/expo-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";

export const metadata: Metadata = { title: "New expo" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewExpoPage() {
  const user = await requireUser();
  const images = await listSiteImages();
  return (
    <ExpoEditor
      images={images}
      canDelete={user.role === "admin"}
      initial={{ id: null, slug: "", name: "", summary: "", audience: "", covers: [], image: "", imageAlt: "", startsAt: null, endsAt: null, venue: "", city: "Medan", registerUrl: "", published: false, updatedAt: null }}
    />
  );
}
