import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { ArticleSummary } from "@/lib/articles";
import type { Locale } from "@/i18n/routing";
import { localePath } from "@/lib/utils";
import { ArrowRight, BookOpen, CalendarDays, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const dateLabel = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso));

/** The newest published articles from the CMS. The heading comes from the Homepage editor. */
export function ArticlesShowcase({ locale, intro, articles }: { locale: Locale; intro: { eyebrow: string; title: string; more: string; viewAll: string }; articles: ArticleSummary[] }) {
  return (
    <section id="articles" className="relative overflow-hidden bg-white px-4 py-20 md:px-6 md:py-24">
      <div className="pointer-events-none absolute -top-10 -left-16 size-72 rounded-full bg-[radial-gradient(circle,rgb(146_148_153/0.22),transparent_68%)]" aria-hidden="true" />
      <div className="text-logo/55 pointer-events-none absolute top-10 right-8 size-24" aria-hidden="true">
        <svg viewBox="0 0 80 80" className="size-full">
          {[
            [18, 14, 12, -28],
            [42, 10, 10, 36],
            [28, 30, 14, -12],
            [54, 28, 11, 48],
            [16, 48, 10, 22],
            [40, 52, 13, -34],
          ].map(([x, y, width, rotate]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={width} height="3" rx="1.5" fill="currentColor" transform={`rotate(${rotate} ${x} ${y})`} />
          ))}
        </svg>
      </div>

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <p className="bg-accent-soft text-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {intro.eyebrow}
        </p>
        <h2 className="mx-auto mt-5 max-w-[20ch] text-[clamp(2rem,1.1rem+1.6vw,3.15rem)] leading-[1.08] font-semibold tracking-tight">{intro.title}</h2>
      </Reveal>

      <Stagger as="ul" className="relative mx-auto mt-12 grid w-full max-w-6xl gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <StaggerItem key={article.slug} as="li">
            <article className="interactive-lift group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_44px_rgb(11_16_32/0.08)]">
              {article.coverImage ? (
                <div className="relative h-52 overflow-hidden">
                  <Image src={article.coverImage} alt={article.coverAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
                <p className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <time dateTime={article.publishedAt}>{dateLabel(article.publishedAt)}</time>
                  </span>
                  {article.author ? (
                    <>
                      <span className="text-line" aria-hidden="true">
                        |
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="size-3.5" aria-hidden="true" />
                        {article.author}
                      </span>
                    </>
                  ) : null}
                </p>
                <h3 className="text-ink mt-3 text-xl leading-snug font-semibold tracking-tight">{article.title}</h3>
                {article.excerpt ? <p className="text-muted mt-2 line-clamp-2 text-sm leading-6">{article.excerpt}</p> : null}
                <Link
                  href={localePath(locale, `/articles/${article.slug}`)}
                  aria-label={`${intro.more}: ${article.title}`}
                  className="text-muted hover:text-brand mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold transition-colors"
                >
                  {intro.more}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="relative mt-12 flex justify-center" delay={0.1}>
        <Link
          href={localePath(locale, "/articles")}
          className="bg-brand hover:bg-brand-deep inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          {intro.viewAll}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}
