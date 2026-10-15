import { TextPage } from "@/components/layout/text-page";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.terms;
  return pageMetadata(locale, "/terms", seo.title, seo.description);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const home = "Home";
  return (
    <TextPage
      locale={locale}
      eyebrow={copy.footer.legal}
      title={copy.legal.terms.title}
      body={copy.legal.terms.intro}
      blocks={copy.legal.terms.sections}
      draft={copy.legal.draft}
      crumbs={[
        { name: home, path: "/" },
        { name: copy.footer.terms, path: "/terms" },
      ]}
    />
  );
}
