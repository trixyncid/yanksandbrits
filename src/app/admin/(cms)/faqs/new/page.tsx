import type { Metadata } from "next";
import { FaqEditor } from "@/components/admin/faq-editor";
import { requireUser } from "@/lib/auth/session";
import { listCmsFaqs } from "@/lib/cms/faqs";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "New question" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewFaqPage() {
  const user = await requireUser();
  const [rows, programs] = await Promise.all([listCmsFaqs(), getPrograms("en")]);
  return (
    <FaqEditor
      categories={[...new Set(rows.map((row) => row.category))]}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      canDelete={user.role === "admin"}
      initial={{ id: null, question: "", answer: "", category: "General", programs: [], showOnContact: false, published: false, updatedAt: null }}
    />
  );
}
