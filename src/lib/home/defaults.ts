import { getBundle } from "@/lib/content";
import type { HomeContent } from "./schema";

/**
 * The starting content for a database that has none yet: the site's real copy, with no sample
 * figures. `bun run db:seed` stores it, and from then on the Homepage editor owns every word.
 */
export function defaultHomeContent(): HomeContent {
  const copy = getBundle("en");
  return {
    hero: {
      title: copy.hero.title,
      highlight: copy.hero.highlight,
      body: copy.hero.body,
      cta: copy.hero.primary,
      image: "/images/class.jpg",
      imageAlt: "Students studying together in a library",
    },
    features: {
      programs: { title: copy.nav.programs, body: copy.programsIntro.body },
      counsellors: { title: copy.nav.counselling, body: copy.counsellor.body },
      studyAbroad: { title: copy.nav.studyAbroad, body: copy.services.body },
      more: copy.hero.more,
    },
    programs: { eyebrow: copy.programsIntro.eyebrow, title: copy.programsIntro.title, body: copy.programsIntro.body, see: copy.programsIntro.see },
    why: {
      eyebrow: copy.counsellor.eyebrow,
      title: copy.counsellor.title,
      body: copy.counsellor.body,
      highlights: [copy.nav.programs, copy.nav.counselling],
      cta: copy.nav.cta,
      imageMain: "/images/study.jpg",
      imageInset: "/images/class.jpg",
      badgeValue: "",
      badgeLabel: "",
    },
    figures: { items: [], note: "" },
    journey: {
      eyebrow: copy.journey.eyebrow,
      title: copy.journey.title,
      body: copy.journey.body,
      cta: copy.journey.cta,
      columns: copy.journey.columns.map((column) => ({ title: column.title, groups: column.groups.map((group) => ({ heading: group.heading, items: [...group.items] })) })),
    },
    testimonials: { eyebrow: copy.testimonialsIntro.eyebrow, title: copy.testimonialsIntro.title },
    previews: {
      tutors: { title: copy.previews.tutors.title, body: copy.previews.tutors.body, link: copy.previews.tutors.link, image: "/images/class.jpg" },
      expo: { title: copy.previews.expo.title, body: copy.previews.expo.body, link: copy.previews.expo.link, image: "/images/london.jpg" },
    },
    articles: { eyebrow: copy.articlesIntro.eyebrow, title: copy.articlesIntro.title, more: copy.articlesIntro.more, viewAll: copy.articlesIntro.viewAll },
  };
}
