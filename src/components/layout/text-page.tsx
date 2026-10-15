import { FaqList } from "@/components/layout/faq-list";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import { breadcrumbJsonLd } from "@/lib/seo/metadata";
import { localePath } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function TextPage({
  locale,
  eyebrow,
  title,
  body,
  blocks = [],
  crumbs,
  children,
  draft,
  wide = false,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  body: string;
  blocks?: { heading: string; body: string }[];
  crumbs: { name: string; path: string }[];
  children?: ReactNode;
  draft?: string;
  wide?: boolean;
}) {
  return (
    <article className={`mx-auto w-full px-4 py-12 md:px-6 md:py-16 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      <Reveal>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
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
      </Reveal>
      <Reveal className="mt-6 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] md:p-10" delay={0.06}>
        <p className="text-sm font-semibold text-accent">{eyebrow}</p>
        <h1 className="mt-3 text-[clamp(2.25rem,1.2rem+2.4vw,3.5rem)] leading-[1.08] font-semibold tracking-tight">{title}</h1>
        {draft ? <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">{draft}</p> : null}
        <p className="mt-5 text-lg leading-8 text-muted">{body}</p>
        <Stagger className="mt-10 space-y-8" delay={0.1}>
          {blocks.map((block) => (
            <StaggerItem key={block.heading} as="div">
              <section>
                <h2 className="text-2xl font-semibold tracking-tight">{block.heading}</h2>
                <p className="mt-3 leading-7">{block.body}</p>
              </section>
            </StaggerItem>
          ))}
        </Stagger>
        {children}
      </Reveal>
    </article>
  );
}

export function FaqBlock({ items }: { items: { id: string; question: string; answer: string }[] }) {
  return (
    <div className="mt-10">
      <FaqList items={items} />
    </div>
  );
}
