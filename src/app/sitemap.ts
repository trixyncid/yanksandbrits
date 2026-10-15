import { getPublishedArticles } from "@/lib/articles";
import { getSettings } from "@/lib/content";
import { getTutors } from "@/lib/people";
import { getPrograms } from "@/lib/programs";
import { staticPaths } from "@/lib/seo/routes";
import { getStories } from "@/lib/stories";
import type { MetadataRoute } from "next";

// Static pages plus every published program, tutor, article, and story in the CMS.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = getSettings();
  const [programs, tutors, articles, stories] = await Promise.all([getPrograms("en"), getTutors("en"), getPublishedArticles(), getStories()]);
  const url = (path: string) => `${settings.siteUrl}${path === "/" ? "" : path}`;
  return [
    ...staticPaths.map((path) => ({ url: url(path) })),
    ...programs.map((program) => ({ url: url(`/programs/${program.slug}`) })),
    ...tutors.map((tutor) => ({ url: url(`/tutors/${tutor.slug}`) })),
    ...articles.map((article) => ({ url: url(`/articles/${article.slug}`), lastModified: new Date(article.publishedAt) })),
    ...stories.map((story) => ({ url: url(`/success-stories/${story.slug}`) })),
  ];
}
