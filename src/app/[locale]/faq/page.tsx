import { FaqView } from "@/components/sections/faq-view";
import { getBundle } from "@/lib/content";
import { getFaqs } from "@/lib/faqs";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.faq;
  return pageMetadata(locale, "/faq", seo.title, seo.description);
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return <FaqView locale={locale} copy={getBundle(locale)} faqs={await getFaqs()} />;
}
