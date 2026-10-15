import { TextPage } from "@/components/layout/text-page";
import { getBundle } from "@/lib/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.privacy;
  return pageMetadata(locale, "/privacy", seo.title, seo.description);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  const home = "Home";
  return (
    <TextPage
      locale={locale}
      eyebrow={copy.footer.legal}
      title={copy.legal.privacy.title}
      body={copy.legal.privacy.intro}
      blocks={copy.legal.privacy.sections}
      draft={copy.legal.draft}
      crumbs={[
        { name: home, path: "/" },
        { name: copy.footer.privacy, path: "/privacy" },
      ]}
    />
  );
}
