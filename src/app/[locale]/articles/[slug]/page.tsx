import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedArticle, getPublishedArticles } from "@/lib/articles";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = Promise<{ locale: string; slug: string }>;

// With Cache Components an empty list is a build error, so before the first article is published
// this returns a placeholder slug, which finds no article and renders the 404 page.
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.length ? articles.map((article) => ({ locale: "en", slug: article.slug })) : [{ locale: "en", slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const article = await getPublishedArticle(slug);
  if (!article) return {};
  const metadata = pageMetadata(locale, `/articles/${article.slug}`, article.seoTitle || article.title, article.seoDescription || article.excerpt);
  return {
    ...metadata,
    ...(article.coverImage ? { openGraph: { ...metadata.openGraph, type: "article", images: [{ url: article.coverImage }] } } : {}),
    ...(article.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

const dateLabel = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso));

// Articles published after a build are not in generateStaticParams, so the slug is read inside a
// boundary and those pages stream in behind a skeleton (same as program pages).
export default function ArticlePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const copy = getBundle(locale);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: copy.nav.articles, path: "/articles" },
    { name: article.title, path: `/articles/${article.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          ...(article.excerpt ? { description: article.excerpt } : {}),
          datePublished: article.publishedAt,
          ...(article.author ? { author: { "@type": "Person", name: article.author } } : {}),
          ...(article.coverImage ? { image: article.coverImage } : {}),
        }}
      />

      <article className="bg-white px-4 pt-10 pb-20 md:px-6 md:pt-14 md:pb-28">
        <header className="mx-auto w-full max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href={localePath(locale, "/articles")} className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-brand hover:underline">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {copy.nav.articles}
            </Link>
          </nav>
          {article.category ? <p className="mt-8 text-sm font-semibold tracking-[0.16em] text-brand uppercase">{article.category}</p> : null}
          <h1 className="mt-3 text-[clamp(2.2rem,1.3rem+2.4vw,3.4rem)] leading-[1.08] font-semibold tracking-tight text-balance">{article.title}</h1>
          {article.excerpt ? <p className="mt-5 text-lg leading-8 text-muted">{article.excerpt}</p> : null}
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              <time dateTime={article.publishedAt}>{dateLabel(article.publishedAt)}</time>
            </span>
            {article.author ? (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-4" aria-hidden="true" />
                {article.author}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {article.readingTime} min read
            </span>
          </p>
        </header>

        {article.coverImage ? (
          <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-[1.75rem]">
            <Image src={article.coverImage} alt={article.coverAlt} fill priority className="object-cover" sizes="(min-width: 1024px) 64rem, 100vw" />
          </div>
        ) : null}

        {/* Rendered on save from the editor's sanitised document (see src/lib/cms/articles.ts). */}
        <div className="article-prose mx-auto mt-10 w-full max-w-3xl" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

        <div className="mx-auto mt-14 flex w-full max-w-3xl flex-col items-start gap-4 rounded-[1.75rem] bg-surface p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <p className="max-w-[34ch] text-lg leading-7 font-semibold tracking-tight">Questions about your own plan? Talk to a counsellor.</p>
          <Link href={`${localePath(locale, "/contact")}#form`} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-deep">
            {copy.nav.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="bg-white px-4 pt-14 pb-24 md:px-6" aria-busy="true">
      <div className="mx-auto w-full max-w-3xl animate-pulse space-y-5">
        <div className="h-4 w-24 rounded bg-logo-soft" />
        <div className="h-24 rounded-2xl bg-logo-soft" />
        <div className="h-12 rounded-xl bg-logo-soft" />
        <div className="h-72 rounded-[1.75rem] bg-logo-soft" />
      </div>
    </div>
  );
}
