import { JsonLd } from "@/components/seo/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { ArticleSummary } from "@/lib/articles";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const dateLabel = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso));

/** Published articles from the CMS, newest first. */
export function ArticlesView({ locale, copy, articles }: { locale: Locale; copy: Bundle; articles: ArticleSummary[] }) {
  const consult = `${localePath(locale, "/contact")}#form`;
  const home = "Home";
  const crumbs = [
    { name: home, path: "/" },
    { name: copy.nav.articles, path: "/articles" },
  ];
  const labels = {
    index: "Reading index",
    categories: "Topics",
    empty: "No articles yet. New writing will appear here.",
    next: "Have a question an article does not answer?",
    nextBody: "Ask about scores, campuses, or pathways. A counsellor will answer it for your situation.",
    featured: "Featured",
  };
  // Topics come from the articles themselves, so the list never names one with nothing in it.
  const cats = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const [featured, ...rest] = articles;
  const href = (slug: string) => localePath(locale, `/articles/${slug}`);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      {/* Reading-room masthead — typography first */}
      <section className="bg-surface relative overflow-hidden px-4 pt-10 pb-14 md:px-6 md:pt-14 md:pb-20">
        <div className="bg-brand pointer-events-none absolute top-0 left-0 h-full w-2" aria-hidden="true" />
        <div className="font-display text-logo/15 pointer-events-none absolute top-8 -right-8 text-[10rem] leading-none select-none md:text-[14rem]" aria-hidden="true">
          Aa
        </div>

        <Reveal className="relative mx-auto w-full max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-muted text-sm">
            <ol className="flex flex-wrap gap-2">
              {crumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {index === crumbs.length - 1 ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <Link href={localePath(locale, crumb.path)} className="underline-offset-4 hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p className="text-brand mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.16em] uppercase">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {copy.articlesPage.eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(2.6rem,1.3rem+2.8vw,4rem)] leading-[1.05] font-semibold tracking-tight text-balance">{copy.articlesPage.title}</h1>
          <p className="text-muted mt-5 max-w-[42ch] text-base leading-7 md:text-lg md:leading-8">{copy.articlesPage.body}</p>

          {cats.length ? (
            <div className="mt-8">
              <p className="text-logo text-xs font-semibold tracking-[0.14em] uppercase">{labels.categories}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {cats.map((cat) => (
                  <li key={cat}>
                    <span className="border-line text-muted hover:border-brand hover:text-brand inline-flex rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium transition-colors">
                      {cat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Reveal>
      </section>

      {/* Magazine index — featured + rows, not home card grid */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
        <Reveal className="relative mx-auto mb-10 flex w-full max-w-6xl flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-brand text-sm font-semibold tracking-wide uppercase">{labels.index}</p>
            <h2 className="mt-2 max-w-[18ch] text-[clamp(1.9rem,1rem+1.5vw,2.85rem)] leading-[1.08] font-semibold tracking-tight">{copy.articlesIntro.title}</h2>
          </div>
          {articles.length === 0 ? <p className="text-muted max-w-[32ch] text-sm leading-6 md:text-right">{labels.empty}</p> : null}
        </Reveal>

        {featured ? (
          <Reveal>
            <article className="group border-line relative mx-auto grid w-full max-w-6xl gap-6 overflow-hidden border-y py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
              {featured.coverImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] lg:aspect-[5/3]">
                  <Image
                    src={featured.coverImage}
                    alt={featured.coverAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 55vw, 100vw"
                  />
                </div>
              ) : null}
              <div>
                <p className="text-brand text-xs font-semibold tracking-[0.16em] uppercase">{labels.featured}</p>
                <h3 className="text-ink mt-3 text-2xl leading-snug font-semibold tracking-tight md:text-3xl">
                  {/* The whole card is the link. */}
                  <Link href={href(featured.slug)} className="group-hover:text-brand after:absolute after:inset-0">
                    {featured.title}
                  </Link>
                </h3>
                {featured.excerpt ? <p className="text-muted mt-3 text-base leading-7">{featured.excerpt}</p> : null}
                <p className="text-muted mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <time dateTime={featured.publishedAt}>{dateLabel(featured.publishedAt)}</time>
                  </span>
                  {featured.author ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{featured.author}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </article>
          </Reveal>
        ) : null}

        <Stagger as="ul" className="relative mx-auto mt-2 w-full max-w-6xl">
          {rest.map((article) => (
            <StaggerItem key={article.slug} as="li" className="border-line border-b">
              <article className={`group hover:bg-logo-soft/40 relative grid gap-4 py-6 transition-colors sm:items-center sm:gap-6 ${article.coverImage ? "sm:grid-cols-[6.5rem_1fr]" : ""}`}>
                {article.coverImage ? (
                  <div className="relative h-24 overflow-hidden rounded-[1rem] sm:h-20 sm:w-[6.5rem]">
                    <Image src={article.coverImage} alt={article.coverAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="104px" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <time dateTime={article.publishedAt}>{dateLabel(article.publishedAt)}</time>
                    {article.author ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{article.author}</span>
                      </>
                    ) : null}
                  </p>
                  <h3 className="text-ink group-hover:text-brand mt-1.5 text-lg font-semibold tracking-tight transition-colors md:text-xl">
                    <Link href={href(article.slug)} className="after:absolute after:inset-0">
                      {article.title}
                    </Link>
                  </h3>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-header relative overflow-hidden px-4 py-16 text-white md:px-6 md:py-20">
        <div className="pointer-events-none absolute right-8 bottom-0 size-40 rounded-full bg-[radial-gradient(circle,rgb(37_60_161/0.5),transparent_68%)]" aria-hidden="true" />
        <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,1rem+1.4vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">{labels.next}</h2>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-white/75">{labels.nextBody}</p>
          </div>
          <Link href={consult} className="bg-brand inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5">
            {copy.nav.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
