import { StoryDetailView } from "@/components/sections/story-detail-view";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";
import { getStories, getStory } from "@/lib/stories";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = Promise<{ locale: string; slug: string }>;

// With Cache Components an empty list is a build error, so before the first story is published
// this returns a placeholder slug, which finds no story and renders the 404 page.
export async function generateStaticParams() {
  const stories = await getStories();
  return stories.length ? stories.map((story) => ({ locale: "en", slug: story.slug })) : [{ locale: "en", slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const story = await getStory(slug);
  if (!story) return {};
  const title = `${story.studentName}'s story`.slice(0, 60);
  const metadata = pageMetadata(locale, `/success-stories/${story.slug}`, title, story.headline.slice(0, 155));
  return story.photo ? { ...metadata, openGraph: { ...metadata.openGraph, type: "article", images: [{ url: story.photo }] } } : metadata;
}

// Stories published after a build stream in behind a skeleton (same as articles and programs).
export default function StoryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] animate-pulse bg-header" aria-busy="true" />}>
      <StoryContent params={params} />
    </Suspense>
  );
}

async function StoryContent({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const stories = await getStories();
  const story = stories.find((item) => item.slug === slug);
  if (!story) notFound();
  return <StoryDetailView locale={locale} copy={getBundle(locale)} story={story} others={stories.filter((item) => item.slug !== story.slug)} />;
}
