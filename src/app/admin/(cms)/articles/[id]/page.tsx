import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/editor/article-editor";
import { requireUser } from "@/lib/auth/session";
import { getArticleForEdit, getCategories } from "@/lib/cms/articles";
import type { DocNode } from "@/lib/cms/document";

export const metadata: Metadata = { title: "Edit article" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [article, categories] = await Promise.all([getArticleForEdit(id), getCategories()]);
  if (!article) notFound();

  return (
    <ArticleEditor
      // A fresh editor per article, so client state never leaks between two records.
      key={article.id}
      categories={categories}
      canDelete={user.role === "admin" || article.authorId === user.id}
      initial={{
        id: article.id,
        locale: article.locale,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content as DocNode,
        coverImage: article.coverImage ?? "",
        coverAlt: article.coverAlt ?? "",
        category: article.category,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        seoTitle: article.seoTitle ?? "",
        seoDescription: article.seoDescription ?? "",
        noindex: article.noindex,
        updatedAt: article.updatedAt.toISOString(),
        authorName: article.author?.name ?? null,
      }}
    />
  );
}
