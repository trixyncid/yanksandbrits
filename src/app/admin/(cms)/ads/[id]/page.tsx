import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdEditor } from "@/components/admin/ad-editor";
import { requireUser } from "@/lib/auth/session";
import { adFormOptions } from "@/lib/cms/ad-form";
import { getAdForEdit } from "@/lib/cms/ads";
import { sponsorCopySchema } from "@/lib/sponsors/schema";
import { isSlotId } from "@/lib/sponsors/slots";
import { z } from "zod";

export const metadata: Metadata = { title: "Edit campaign" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const empty = { title: "", body: "", cta: "" };

// Names for placements that were retired, so editors recognise what their campaign lost.
const retiredNames: Record<string, string> = {
  "home-feature": "Home feature card",
  "home-card": "Home card",
  "study-abroad-featured": "Study abroad pinned row",
  program: "Program pages",
  "articles-row": "Articles list",
  "expo-partners": "Expo partner logos",
  "footer-partners": "Footer partner logos",
};
const retiredLabel = (slot: string) => retiredNames[slot] ?? slot;
const copySchema = z.object({ en: sponsorCopySchema });

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [ad, options] = await Promise.all([getAdForEdit(id), adFormOptions()]);
  if (!ad) notFound();
  const copy = copySchema.safeParse(ad.copy);
  return (
    <AdEditor
      key={ad.id}
      {...options}
      canDelete={user.role === "admin"}
      retired={ad.slots.filter((slot) => !isSlotId(slot)).map(retiredLabel)}
      initial={{
        id: ad.id,
        slug: ad.slug,
        advertiser: ad.advertiser,
        kind: ad.kind,
        country: ad.country ?? "",
        city: ad.city ?? "",
        majors: ad.majors,
        slots: ad.slots.filter(isSlotId),
        programs: [],
        startsOn: ad.startsOn.toISOString().slice(0, 10),
        endsOn: ad.endsOn.toISOString().slice(0, 10),
        active: ad.active,
        weight: ad.weight,
        href: ad.href,
        image: ad.image ?? "",
        logo: ad.logo ?? "",
        copy: copy.success ? copy.data : { en: empty },
        updatedAt: ad.updatedAt.toISOString(),
      }}
    />
  );
}
