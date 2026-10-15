export const programSlugs = ["ielts", "toefl", "computer-science", "hsk"] as const;

export type ProgramSlug = (typeof programSlugs)[number];

export type ProgramContent = {
  slug: ProgramSlug;
  category: "language" | "academic";
  name: string;
  headline: string;
  tag: string;
  summary: string;
  outcomes: string[];
  targetAudience: string;
  format: "hybrid";
  formatLabel: string;
  duration: string;
  schedule: string;
  level: string;
  syllabus: string[];
  seoTitle: string;
  seoDescription: string;
};

export type FaqContent = {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedProgram: ProgramSlug | null;
};

export type TextBlock = {
  heading: string;
  body: string;
};

export type CounsellorContent = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  specialisations: string[];
  countries: string[];
  active: boolean;
};

export type Bundle = {
  seo: Record<string, { title: string; description: string }>;
  a11y: { skip: string; menu: string; close: string };
  nav: {
    programs: string;
    studyAbroad: string;
    counselling: string;
    tutors: string;
    expo: string;
    articles: string;
    about: string;
    contact: string;
    cta: string;
  };
  ads: { sponsored: string };
  navMenu: {
    label: string;
    explore: string;
    allPrograms: string;
    helpTitle: string;
    helpBody: string;
    more: string;
    descriptions: { expo: string; articles: string; stories: string; faq: string };
  };
  footer: {
    programs: string;
    company: string;
    legal: string;
    privacy: string;
    terms: string;
    faq: string;
    success: string;
    design: string;
    hours: string;
    social: string;
    cityNote: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    body: string;
    primary: string;
    secondary: string;
    more: string;
    previous: string;
    next: string;
    pause: string;
    play: string;
    slide: string;
  };
  universitiesIntro: {
    eyebrow: string;
    title: string;
    preview: string;
    viewAll: string;
    allFilter: string;
    ratingLabel: string;
    pathwaysLabel: string;
    note: string;
  };
  programsIntro: {
    eyebrow: string;
    title: string;
    body: string;
    see: string;
    ask: string;
  };
  programs: ProgramContent[];
  articlesIntro: {
    eyebrow: string;
    title: string;
    more: string;
    viewAll: string;
  };
  testimonialsIntro: {
    eyebrow: string;
    title: string;
    previous: string;
    next: string;
  };
  counsellor: {
    eyebrow: string;
    title: string;
    body: string;
    steps: { title: string; body: string }[];
    checksTitle: string;
    checks: string[];
    link: string;
  };
  services: { eyebrow: string; title: string; body: string; items: TextBlock[] };
  journey: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    whoLabel: string;
    steps: { title: string; body: string; who: string }[];
    columns: {
      title: string;
      groups: { heading: string; items: string[] }[];
    }[];
  };
  previews: {
    tutors: { title: string; body: string; empty: string; link: string };
    stories: { title: string; body: string; empty: string; link: string };
    expo: { title: string; body: string; empty: string; link: string };
    articles: { title: string; body: string; empty: string; link: string };
  };
  faqIntro: { eyebrow: string; title: string; body: string };
  faqs: FaqContent[];
  finalCta: { title: string; body: string; reassurance: string };
  form: {
    title: string;
    name: string;
    whatsapp: string;
    programs: string;
    consent: string;
    submit: string;
    skip: string;
    /** Button on the WhatsApp popup's form, where sending leads straight into the chat. */
    submitWhatsapp: string;
    /** Use {name} for the visitor's first name. */
    successTitle: string;
    successBody: string;
    successPromise: string;
    /** Use {seconds}. */
    redirecting: string;
    redirectingNow: string;
    stay: string;
    /** Added to the prepared WhatsApp message. Use {name}. */
    whatsappNameLine: string;
    errorBody: string;
    whatsappCta: string;
    errors: {
      name: string;
      whatsapp: string;
      programs: string;
      consent: string;
    };
  };
  whatsapp: {
    float: string;
    missing: string;
    programText: string;
    pageText: string;
    generalText: string;
    popupEyebrow: string;
    popupTitle: string;
    popupBody: string;
    popupSkip: string;
  };
  consent: {
    title: string;
    body: string;
    necessary: string;
    analytics: string;
    save: string;
    reject: string;
  };
  prompt: { title: string; body: string; cta: string; dismiss: string };
  contact: {
    eyebrow: string;
    title: string;
    highlight: string;
    body: string;
    promises: string[];
    formNote: string;
    /** Under the hero promises: points to the branches section. */
    visitLink: string;
    visitEyebrow: string;
    visitTitle: string;
    visitBody: string;
    directions: string;
    hoursLabel: string;
    nextEyebrow: string;
    nextTitle: string;
    nextBody: string;
    steps: TextBlock[];
    faqEyebrow: string;
    faqTitle: string;
    faqBody: string;
    closingTitle: string;
    closingBody: string;
    closingCta: string;
    closingVisit: string;
  };
  counsellingPage: { eyebrow: string; title: string; body: string; blocks: TextBlock[] };
  counsellorsIntro: {
    eyebrow: string;
    title: string;
    body: string;
    ask: string;
    specialisationsLabel: string;
    countriesLabel: string;
    statusActive: string;
    statusAway: string;
  };
  studyAbroad: { eyebrow: string; title: string; body: string; blocks: TextBlock[] };
  successPage: {
    eyebrow: string;
    title: string;
    body: string;
    emptyTitle: string;
    emptyBody: string;
    promises: { title: string; body: string }[];
    nextTitle: string;
    nextBody: string;
  };
  tutorsPage: { eyebrow: string; title: string; body: string };
  expoPage: {
    eyebrow: string;
    title: string;
    body: string;
    lineupEyebrow: string;
    lineupTitle: string;
    lineupNote: string;
    dateLabel: string;
    venueLabel: string;
    audienceLabel: string;
    coversLabel: string;
    datePending: string;
    venueValue: string;
    register: string;
    ask: string;
    next: string;
    nextBody: string;
    events: {
      slug: string;
      name: string;
      summary: string;
      audience: string;
      image: string;
      covers: string[];
    }[];
  };
  articlesPage: { eyebrow: string; title: string; body: string };
  designPage: { eyebrow: string; title: string; body: string };
  legal: {
    draft: string;
    privacy: { title: string; intro: string; sections: TextBlock[] };
    terms: { title: string; intro: string; sections: TextBlock[] };
  };
  notFound: { title: string; body: string; home: string };
  error: { title: string; body: string; retry: string };
};
