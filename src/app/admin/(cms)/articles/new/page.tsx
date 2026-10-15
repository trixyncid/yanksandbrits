import type { Metadata } from "next";
import { ArticleEditor } from "@/components/admin/editor/article-editor";
import { requireUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/cms/articles";
import { emptyDoc } from "@/lib/cms/document";

export const metadata: Metadata = { title: "New article" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function NewArticlePage() {
  const user = await requireUser();
  const categories = await getCategories();

  return (
    <ArticleEditor
      categories={categories}
      canDelete={false}
      initial={{
        id: null,
        locale: "en",
        title: "",
        slug: "",
        excerpt: "",
        content: emptyDoc,
        coverImage: "",
        coverAlt: "",
        category: "",
        tags: [],
        status: "draft",
        publishedAt: null,
        seoTitle: "",
        seoDescription: "",
        noindex: false,
        updatedAt: null,
        authorName: user.name,
      }}
    />
  );
}
