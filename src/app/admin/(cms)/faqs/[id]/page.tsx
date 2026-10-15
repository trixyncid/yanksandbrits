import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqEditor } from "@/components/admin/faq-editor";
import { requireUser } from "@/lib/auth/session";
import { listCmsFaqs } from "@/lib/cms/faqs";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "Edit question" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [rows, programs] = await Promise.all([listCmsFaqs(), getPrograms("en")]);
  const row = rows.find((item) => item.id === id);
  if (!row) notFound();
  return (
    <FaqEditor
      key={row.id}
      categories={[...new Set(rows.map((item) => item.category))]}
      programs={programs.map(({ slug, name }) => ({ slug, name }))}
      canDelete={user.role === "admin"}
      initial={{ id: row.id, question: row.question, answer: row.answer, category: row.category, programs: row.programs, showOnContact: row.showOnContact, published: row.published, updatedAt: row.updatedAt.toISOString() }}
    />
  );
}
