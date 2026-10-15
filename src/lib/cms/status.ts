export type ArticleState = "draft" | "published" | "scheduled";

export function articleState(article: { status: "draft" | "published"; publishedAt: Date | null }, now: Date): ArticleState {
  if (article.status === "draft") return "draft";
  return article.publishedAt && article.publishedAt > now ? "scheduled" : "published";
}
