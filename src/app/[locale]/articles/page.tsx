import { ArticlesView } from "@/components/sections/articles-view";
import { getPublishedArticles } from "@/lib/articles";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.articles;
  return pageMetadata(locale, "/articles", seo.title, seo.description);
}

export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const articles = await getPublishedArticles();
  return <ArticlesView locale={locale} copy={copy} articles={articles} />;
}
