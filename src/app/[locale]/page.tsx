import { HomeView } from "@/components/sections/home-view";
import { getPublishedArticles } from "@/lib/articles";
import { getBundle } from "@/lib/content";
import { getNextExpo } from "@/lib/expos";
import { getHomeContent } from "@/lib/home";
import { getPrograms } from "@/lib/programs";
import { getSponsors } from "@/lib/sponsors";
import { getTestimonials } from "@/lib/testimonials";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  return pageMetadata(locale, "/", copy.seo.home.title, copy.seo.home.description);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const copy = getBundle(locale);
  // Everything on this page comes from the CMS. `copy` only supplies interface labels.
  const [home, programs, testimonials, articles, nextExpo, heroAds] = await Promise.all([
    getHomeContent(),
    getPrograms(locale),
    getTestimonials(),
    getPublishedArticles(3),
    getNextExpo(),
    getSponsors(locale, "home-hero"),
  ]);
  return <HomeView locale={locale} copy={copy} home={home} programs={programs} testimonials={testimonials} articles={articles} nextExpo={nextExpo} heroAds={heroAds} />;
}
