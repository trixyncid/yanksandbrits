import { FaqList } from "@/components/layout/faq-list";
import { TextPage } from "@/components/layout/text-page";
import { Button } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/placeholder";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.design;
  return pageMetadata(locale, "/design", seo.title, seo.description);
}

export default async function DesignPage({ params }: { params: Promise<{ locale: string }> }) {
  // A style guide for building the site, with sample content. Not part of the public site.
  if (process.env.NODE_ENV !== "development") notFound();
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const home = "Home";
  return (
    <TextPage
      locale={locale}
      eyebrow={copy.designPage.eyebrow}
      title={copy.designPage.title}
      body={copy.designPage.body}
      crumbs={[
        { name: home, path: "/" },
        { name: copy.footer.design, path: "/design" },
      ]}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <Button>{copy.nav.cta}</Button>
        <Button variant="secondary">{copy.hero.secondary}</Button>
        <Button variant="outline">{copy.form.skip}</Button>
      </div>
      <p className="mt-6">
        <Placeholder>[REPLACE: company name]</Placeholder>
      </p>
      <div className="mt-8">
        <FaqList items={copy.faqs.slice(0, 2)} />
      </div>
    </TextPage>
  );
}
