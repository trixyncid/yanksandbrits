import type { Metadata } from "next";
import { StoryEditor } from "@/components/admin/story-editor";
import { requireUser } from "@/lib/auth/session";
import { listSiteImages } from "@/lib/cms/programs";
import { listCountries } from "@/lib/countries";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "New story" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewStoryPage() {
  const user = await requireUser();
  const [images, programs] = await Promise.all([listSiteImages(), getPrograms("en")]);
  return (
    <StoryEditor
      images={images}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      countries={listCountries()}
      canDelete={user.role === "admin"}
      initial={{
        id: null,
        slug: "",
        studentName: "",
        headline: "",
        body: "",
        program: "",
        scoreLabel: "",
        scoreBefore: "",
        scoreAfter: "",
        destination: "",
        country: "",
        intake: "",
        photo: "",
        photoAlt: "",
        consent: false,
        consentNote: "",
        featured: false,
        published: false,
        updatedAt: null,
      }}
    />
  );
}
