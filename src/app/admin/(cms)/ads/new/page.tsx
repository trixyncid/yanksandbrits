import type { Metadata } from "next";
import { AdEditor } from "@/components/admin/ad-editor";
import { requireUser } from "@/lib/auth/session";
import { adFormOptions } from "@/lib/cms/ad-form";
import { todayWib } from "@/lib/cms/ads";

export const metadata: Metadata = { title: "New campaign" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

const empty = { title: "", body: "", cta: "" };

export default async function NewAdPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const user = await requireUser();
  const [{ kind }, options] = await Promise.all([searchParams, adFormOptions()]);
  const start = todayWib();
  const end = new Date(new Date(`${start}T00:00:00Z`).getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const university = kind !== "brand";
  return (
    <AdEditor
      {...options}
      canDelete={user.role === "admin"}
      initial={{
        id: null,
        slug: "",
        advertiser: "",
        kind: university ? "university" : "brand",
        country: "",
        city: "",
        majors: [],
        slots: university ? ["universities"] : ["home-hero"],
        programs: [],
        startsOn: start,
        endsOn: end,
        active: false,
        weight: 1,
        href: "",
        image: "",
        logo: "",
        copy: { en: empty },
        updatedAt: null,
      }}
    />
  );
}
