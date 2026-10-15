import { ContactView } from "@/components/sections/contact-view";
import { getContactFaqs } from "@/lib/faqs";
import { getBundle } from "@/lib/content";
import { getPrograms } from "@/lib/programs";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const seo = getBundle(locale).seo.contact;
  return pageMetadata(locale, "/contact", seo.title, seo.description);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const [programs, faqs] = await Promise.all([getPrograms(locale), getContactFaqs()]);
  return <ContactView locale={locale} copy={getBundle(locale)} programs={programs.map(({ slug, name }) => ({ slug, name }))} faqs={faqs} />;
}
