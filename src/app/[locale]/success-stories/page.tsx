import { StoriesView } from "@/components/sections/stories-view";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStories } from "@/lib/stories";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.success;
  return pageMetadata(locale, "/success-stories", seo.title, seo.description);
}

export default async function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const stories = await getStories();
  return <StoriesView locale={locale} copy={getBundle(locale)} stories={stories} />;
}
