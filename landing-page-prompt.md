# Master Prompt: Study-Abroad Education Company Website (Next.js, CMS-Ready, Production-Grade)

> Paste everything below the line into your AI coding agent (Claude Code, Cursor, etc.). Fill in the `{{PLACEHOLDERS}}` in Section 0 first. Anything left unfilled must be built as clearly flagged placeholder content, never invented facts.

---

## 0. Project Inputs (fill before running)

| Key | Value |
|---|---|
| Company name | `{{COMPANY_NAME}}` |
| Tagline | `{{TAGLINE}}` |
| Primary city | Medan, North Sumatra, Indonesia |
| Branches / address | `{{ADDRESS}}`, `{{MAPS_LINK}}` |
| WhatsApp number (E.164) | `{{WA_NUMBER}}` |
| Email / phone | `{{EMAIL}}`, `{{PHONE}}` |
| Social links | `{{INSTAGRAM}}`, `{{TIKTOK}}`, `{{YOUTUBE}}`, `{{FACEBOOK}}` |
| Brand colors / logo | `{{BRAND_ASSETS}}` (if none: propose a palette, see Section 11) |
| Target destination countries | `{{COUNTRIES}}` (e.g., Australia, UK, USA, Canada, Singapore, Malaysia, China) |
| Real metrics (students, scores, offers) | `{{METRICS}}` |
| Domain | `{{DOMAIN}}` |
| CRM / lead destination | `{{CRM}}` (HubSpot, Zoho, Google Sheets, or WhatsApp Business API) |

---

## 1. Role

You are a **senior UI/UX engineer and Next.js architect** with 10+ years shipping high-converting, SEO-critical marketing sites for education and service businesses. You own both the design decisions and the production code. You make opinionated decisions, justify them briefly, and never ship demo-quality work.

## 2. Objective

Build the **production-ready website** for an education company in Medan that:

1. **Sells courses:** IELTS, TOEFL, Computer Science (study-abroad prep), and HSK (Chinese proficiency).
2. **Provides end-to-end university application support** (shortlisting, documents, essays, applications, visas, pre-departure).
3. **Differentiates through Education Counsellors** who actively monitor every student's progress and keep them on track.
4. **Converts visitors into leads, and leads into enrolled students** (primary KPI: qualified lead form submissions and WhatsApp clicks).
5. **Is architected from day one to become a CMS-driven site** (EXPO/events, articles, tutors, programs, testimonials, FAQs) without a rewrite.

## 3. Audience and Context

- **Primary personas**
  - *Student (16-24):* high-school or university student, mobile-first, wants clear next steps and proof of results.
  - *Parent (40-55):* often the payer/decision-maker, cares about trust, safety, track record, transparency, and cost. Content must speak to them too.
  - *Young professional:* needs IELTS/TOEFL for postgraduate study or migration.
- **Market realities (design for these):**
  - Indonesian users are overwhelmingly **mobile-first** and often on mid-range Android with variable 4G. Performance is a conversion feature.
  - **WhatsApp is the dominant conversion channel.** It must be a first-class CTA everywhere, with prefilled context-aware messages.
  - Bilingual audience: ship **Bahasa Indonesia (default) and English** from day one.
  - Trust is the biggest barrier. Show real people, real results, real address, real counsellors.
- **Tone:** warm, credible, ambitious, never salesy-hype. Plain language, short sentences.

## 4. Success Metrics (build instrumentation for these)

- Lead conversion rate (visit → form submit or WhatsApp click) target ≥ 4%.
- Lighthouse (mobile, throttled): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- Core Web Vitals (p75, field): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Organic rankings for: "kursus IELTS Medan", "les TOEFL Medan", "kuliah di luar negeri Medan", "kursus HSK Medan", "konsultan studi luar negeri Medan", and related long-tail terms.

## 5. Tech Stack (mandatory unless justified otherwise)

- **Next.js (latest stable) with App Router**, React Server Components by default, TypeScript `strict: true`.
- **Tailwind CSS** with a design-token layer (CSS variables), **shadcn/ui + Radix primitives** for accessible components, `lucide-react` icons.
- **Motion:** `motion` (Framer Motion) used sparingly; respect `prefers-reduced-motion`.
- **i18n:** `next-intl` with locale-prefixed routes (`/id`, `/en`), `hreflang`, localized metadata and slugs.
- **Forms:** `react-hook-form` + `zod`, validated on client **and** server. Submit via Server Actions or Route Handlers.
- **Content layer (CMS-ready):**
  - Define a typed **content repository interface** (`getPrograms()`, `getTutors()`, `getArticles()`, `getExpos()`, etc.) so the data source is swappable.
  - Phase 1: local typed content (MDX/JSON + Zod-validated) behind that interface.
  - Phase 2: swap to a headless CMS (recommend **Sanity** or **Payload CMS**; justify choice in README) with **ISR + on-demand revalidation via webhook**. No component should import raw content files directly.
- **Images:** `next/image`, AVIF/WebP, explicit dimensions, blur placeholders, `priority` only on the LCP image.
- **Fonts:** `next/font` (self-hosted), max 2 families, `display: swap`, subset to Latin.
- **Analytics:** GA4 via GTM or `@next/third-parties`, Meta Pixel optional, **consent-gated**. Vercel Analytics/Speed Insights optional.
- **Spam protection:** Cloudflare Turnstile or hCaptcha + honeypot + rate limiting (Upstash Redis or in-memory fallback).
- **Monitoring:** Sentry (or equivalent) for client and server errors.
- **Quality:** ESLint, Prettier, Husky + lint-staged, Vitest + React Testing Library, Playwright (e2e + a11y via axe), GitHub Actions CI (typecheck, lint, test, build, Lighthouse CI).
- **Deploy target:** Vercel (also provide Docker-compatible notes). Environment variables documented in `.env.example`.

## 6. Information Architecture

```
/                       Home (landing page, primary conversion page)
/programs               Programs overview
/programs/ielts         IELTS
/programs/toefl         TOEFL
/programs/computer-science   Computer Science prep
/programs/hsk           HSK
/study-abroad           University application service + process
/study-abroad/[country] Country landing pages (SEO, Phase 2)
/counselling            Education counsellor model and how progress is tracked
/tutors                 Tutor listing        -> CMS
/tutors/[slug]          Tutor profile        -> CMS
/expo                   Upcoming and past events -> CMS
/expo/[slug]            Event detail + registration -> CMS
/articles               Blog listing (category, search, pagination) -> CMS
/articles/[slug]        Article detail -> CMS
/success-stories        Results and testimonials
/about                  Story, team, accreditation, address
/contact                Contact, map, free consultation form
/faq                    Aggregated FAQ
/privacy, /terms        Legal (UU PDP compliant)
/sitemap.xml, /robots.txt, /not-found, /error
```

Navigation: sticky header (logo, Programs dropdown, Study Abroad, Tutors, EXPO, Articles, About, language switcher, primary CTA "Konsultasi Gratis / Free Consultation"). Mobile: full-screen drawer menu + **sticky bottom action bar** (WhatsApp + Free Consultation).

## 7. Home Page Specification (section by section)

Build each as an isolated, reusable Server Component with its own content type. Keep **one primary CTA** per viewport.

1. **Top utility bar (optional):** next EXPO date or intake deadline + link.
2. **Hero**
   - H1 with outcome-focused promise (e.g., "From IELTS to your offer letter, with a counsellor beside you every step").
   - Subhead naming the 4 programs + university application support.
   - Primary CTA: *Free Consultation* (opens lead modal or scrolls to form). Secondary: *Chat on WhatsApp*.
   - Trust strip under CTAs: student count, countries, offers received, average score gain (**real data only**).
   - One high-quality real photo (students/classroom), optimized as LCP. No stock-photo clichés if real photos are available.
3. **Logo/Destination strip:** destination countries and partner universities (only those with real, verified relationships).
4. **Programs (4 cards)** IELTS, TOEFL, Computer Science, HSK. Each: who it's for, outcome, duration/format, level, "See program" link, and a secondary "Ask about this program" WhatsApp link with prefilled text.
5. **Metrics / Proof section** animated counters (count up once, reduced-motion safe, SSR-safe numbers for SEO): students taught, average band/score improvement, offers secured, countries, years operating, counsellor-to-student ratio. Each metric has a short label and a footnote with date/definition.
6. **Why us: the Counsellor Difference** (key differentiator, give it real visual weight). Explain the loop: *Assess → Plan → Learn → Monitor → Adjust → Apply*. Show how counsellors check progress (mock tests, attendance, scores, 1:1 check-ins, parent updates). Include a simple illustration of a student progress dashboard/report card (clearly labelled as an example if not a real product).
7. **Services:** Beyond courses: university shortlisting, document prep, personal statement/essay review, application submission, scholarship guidance, visa support, pre-departure briefing. Icon cards + short descriptions.
8. **Application Journey (steps):** horizontal stepper on desktop, vertical timeline on mobile. Suggested steps: 1 Free consultation & profile assessment → 2 Choose program & set target score → 3 Learn with tutors, tracked by your counsellor → 4 Shortlist universities & prepare documents → 5 Submit applications → 6 Offers, scholarships & visa → 7 Pre-departure & fly. Each step: what happens, who helps, typical timeline.
9. **Tutors preview:** 4-6 featured tutors (photo, name, subject, key credential, score/experience), link to full list. Pulled from the content layer.
10. **Success stories:** real testimonials with name, photo (with consent), before/after score, university & country. Include a video testimonial slot (lazy-loaded, facade pattern, no heavy iframe on load).
11. **EXPO / Events teaser:** next upcoming event card with date, location, countdown optional, "Register" CTA. Pulled from content layer.
12. **Articles preview:** 3 latest articles. Pulled from content layer.
13. **Pricing/Packages clarity (optional but recommended):** transparent "starting from" or "request a quote" approach; trust is lost on hidden pricing.
14. **FAQ:** 8-10 questions (cost, duration, class size, online vs offline, guarantee policy, how counsellor works, which countries, scholarship, parent involvement). Accordion with FAQPage JSON-LD.
15. **Final CTA + Lead form:** short form (see Section 9), with a reassurance line ("Free, no obligation, reply within 1 working day").
16. **Footer:** address + embedded map link, hours, WhatsApp, socials, program links, legal links, language switcher.

**Persistent conversion elements:** floating WhatsApp button (not obstructing content or cookie banner), sticky mobile CTA bar, exit-intent or timed soft prompt on desktop only (non-intrusive, dismissible, shown once per session, never on mobile).

## 8. CMS-Ready Content Models

Define Zod schemas and TypeScript types now; mirror them 1:1 in the CMS later. Every model includes `slug`, `locale`, `seo {title, description, ogImage, noindex}`, `publishedAt`, `updatedAt`, `status`.

- **Program:** name, category (language | academic), summary, outcomes[], targetAudience, format (online/offline/hybrid), duration, schedule, level, syllabus[], priceFrom, tutors[] (ref), faqs[] (ref), CTA settings.
- **Tutor:** name, photo, role, subjects[], bio (rich text), education[], certifications[] (e.g., IELTS 8.5), teachingExperience, notable results, languages, featured (bool), social links.
- **Article:** title, excerpt, body (rich text/MDX), cover, category, tags[], author (ref Tutor/Counsellor), readingTime (computed), relatedArticles[].
- **Expo/Event:** title, type, startDate, endDate, venue, city, description, participating universities[], agenda[], registration link/form, gallery, status (upcoming/past), capacity.
- **Counsellor:** name, photo, bio, specialisations, countries.
- **Testimonial / SuccessStory:** student name, photo, program, before/after score, university, country, quote, video URL, consent flag.
- **University/Partner:** name, country, logo, link, verified (bool).
- **FAQ:** question, answer, category, relatedProgram.
- **SiteSettings:** contact data, social links, WhatsApp default message, announcement bar, default SEO, tracking IDs.

CMS requirements for Phase 2: draft preview mode (`draftMode()`), role-based access (editor/admin), on-demand revalidation by tag, image pipeline, scheduled publishing for events and articles.

## 9. Lead Capture and Conversion System

**Free Consultation form (short, mobile-friendly):**
- Fields: Full name, WhatsApp number (Indonesian format validation +62), Email (optional), Current education level, Program of interest (multi-select), Target country, Target intake (month/year), "Anything we should know?" (optional), consent checkbox.
- Progressive disclosure: step 1 (name + WhatsApp + program) submits fast; step 2 (optional qualifiers) enriches the lead after submit.
- Capture **UTM params, referrer, landing page, locale, device** as hidden fields.
- On submit: server-side validation → anti-spam → send to CRM/webhook → send notification email to admissions → show success state with next-step expectations and a "Continue on WhatsApp" button prefilled with the lead's program.
- Handle failure gracefully (retry, fallback to WhatsApp link). Never lose a lead silently: log failed submissions to a queue/store.
- **WhatsApp CTAs:** use `https://wa.me/{{WA_NUMBER}}?text=...` with context-aware prefilled text (page + program). Track every click.
- **Other conversion assets:** free placement test / IELTS band estimator (Phase 2), downloadable "Study Abroad Checklist" gated by email, EXPO registration form.
- Microcopy: action-oriented, benefit-led, zero jargon. Show response-time expectation.

## 10. SEO Requirements (non-negotiable)

- Server-render all marketing content. No critical content behind client-only JS.
- `generateMetadata` on every route: unique title (≤60 chars), description (≤155), canonical, Open Graph, Twitter cards, dynamic OG images via `next/og`.
- **Structured data (JSON-LD):** `EducationalOrganization`/`LocalBusiness` (name, address, geo, hours, sameAs), `Course` (per program), `Person` (tutors), `Event` (EXPO), `Article`/`BlogPosting`, `FAQPage`, `BreadcrumbList`, `Review/AggregateRating` only if real and compliant.
- `sitemap.xml` and `robots.txt` generated dynamically, including localized alternates.
- `hreflang` between `/id` and `/en`, plus `x-default`.
- Clean semantic HTML: one `<h1>` per page, logical heading order, descriptive link text, landmark roles.
- Local SEO: NAP consistency, Google Business Profile link, embedded map, city-targeted copy on relevant pages ("Medan", "Sumatera Utara").
- Internal linking strategy: programs ↔ articles ↔ tutors ↔ study-abroad pages; breadcrumbs on deep pages.
- Redirect map support for any legacy URLs from the old site (provide a `redirects.ts` template).
- Core Web Vitals discipline: see Section 13.

## 11. Design System and UX Direction

- **Principles:** trust first, clarity over cleverness, mobile-first, generous whitespace, strong visual hierarchy, real photography, consistent rhythm.
- **Tokens:** define color (brand primary, accent, neutral scale, semantic success/warn/error), typography scale (fluid `clamp()`), spacing (4/8 scale), radius, shadow, z-index, breakpoints.
- If no brand assets are provided, propose a palette that signals *trust + ambition* (e.g., deep blue/navy primary with a warm accent for CTAs), with WCAG AA contrast verified for every text/background pair.
- **Typography:** one display + one text family or a single variable family; body ≥ 16px; line-height 1.5-1.7; max line length ~70ch.
- **Components to build (documented in a lightweight Storybook or `/design` route):** Button, Link, Input, Select, Checkbox, Modal/Drawer, Accordion, Tabs, Stepper/Timeline, Card variants (program, tutor, article, event, testimonial), Stat counter, Badge, Breadcrumb, Pagination, Toast, Skeleton, Section wrapper, CTA banner, Floating WhatsApp, Language switcher.
- **Interaction:** subtle scroll reveals, hover/focus states on every interactive element, optimistic form feedback, skeleton loaders for CMS-driven lists. Animations ≤ 300ms, transform/opacity only. No layout-shifting animations. No autoplaying carousels with essential content (prefer grids or user-controlled sliders).
- **Empty/loading/error states** designed for every data-driven component.
- **Dark mode:** optional; not required for v1.

## 12. Accessibility (WCAG 2.2 AA)

Keyboard-navigable everything, visible focus rings, skip-to-content link, ARIA only where native HTML isn't enough, form labels and error messages programmatically associated, color is never the only signal, touch targets ≥ 44px, `prefers-reduced-motion` honored, alt text policy (decorative = empty alt), accessible modals (focus trap, ESC, return focus), accessible accordion/tabs, captions for video, language attributes set per locale. Automated axe checks in CI plus a manual keyboard/screen-reader pass checklist.

## 13. Performance Budget

- JS shipped on home: aim < 150 KB gzipped initial; prefer Server Components, `dynamic()` for modals/maps/video, avoid heavy libraries (no full lodash, no moment).
- LCP image preloaded and < 120 KB; all other images lazy.
- Third-party scripts loaded `afterInteractive`/`lazyOnload` via a consent-aware loader; measure their cost.
- Embedded maps/videos use click-to-load facades.
- Caching: static generation + ISR for content, appropriate `Cache-Control` headers, font and image immutable caching.
- Test on a throttled mid-range Android profile; Lighthouse CI fails the build below thresholds in Section 4.

## 14. Analytics and Event Tracking Plan

Implement a typed `track(event, params)` wrapper (single place to swap providers). Events: `cta_click` (location, label), `whatsapp_click` (page, program), `lead_form_start`, `lead_form_step_complete`, `lead_form_submit` (success/failure), `program_view`, `tutor_view`, `expo_register_click`, `article_read_50/90`, `faq_expand`, `language_switch`, `scroll_depth`. Include UTM persistence (first-touch + last-touch). Provide a measurement-plan table in the README. Analytics fires only after consent where required.

## 15. Security and Privacy

- Comply with Indonesia's **UU PDP (Personal Data Protection Law)**: explicit consent checkbox on forms, clear privacy policy, data retention statement, contact for data requests; cookie consent banner with granular choices.
- Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), sanitized rich text, server-side validation, rate limiting, secrets only in env vars, no PII in logs, dependency audit in CI.
- Student photos and testimonials only with documented consent (consent flag in CMS model).

## 16. Content Rules (critical)

- **Never fabricate** statistics, testimonials, university partnerships, tutor credentials, scores, accreditation, or awards. If real data is missing, render clearly marked placeholders (`[REPLACE: number of students]`) and list every placeholder in `CONTENT_TODO.md`.
- Write all copy in **Bahasa Indonesia first**, English second, both natural (not literal translations). Provide copy for every section, with CTA text and meta descriptions.
- No guaranteed-admission or guaranteed-score claims unless the company has a legal policy for it; use "we help you prepare/apply" language.

## 17. Project Structure (suggested)

```
/src
  /app/[locale]/(marketing)/...     routes
  /components/{ui,sections,cards,forms,layout,seo}
  /content                          typed local content (Phase 1)
  /lib/{content,cms,analytics,seo,validation,utils}
  /actions                          server actions (lead, expo-registration, newsletter)
  /styles                           tokens + globals
  /messages/{id.json,en.json}       i18n strings
/tests/{unit,e2e}
/.github/workflows
README.md  ARCHITECTURE.md  CONTENT_TODO.md  .env.example
```

## 18. Delivery Plan and Output Requirements

Work in phases and **stop for review at the end of Phase A**:

- **Phase A: Plan (no code):** confirm assumptions, list open questions, final sitemap, design-token proposal, component inventory, content-model schemas, risks. Output as `ARCHITECTURE.md`.
- **Phase B: Foundation:** project scaffold, tooling, CI, tokens, layout, i18n, content layer, SEO utilities, analytics wrapper.
- **Phase C: Home page + conversion system:** all sections, lead form, WhatsApp flows, tracking, consent.
- **Phase D: Inner pages:** programs, study-abroad, counselling, about, contact, FAQ, legal.
- **Phase E: CMS-driven pages:** tutors, EXPO, articles with listing/detail templates, JSON-LD, sitemap. Then CMS integration notes or implementation.
- **Phase F: Hardening:** a11y audit, performance pass, e2e tests, security headers, README, handoff docs.

For each phase provide: what was built, how to run it, how it was verified, and what remains.

## 19. Definition of Done

- [ ] `pnpm build` passes with zero type/lint errors; CI green.
- [ ] Lighthouse mobile thresholds from Section 4 met on Home, a Program page, an Article page.
- [ ] axe reports zero serious/critical violations; keyboard-only walkthrough passes.
- [ ] Lead form works end-to-end (validation, spam protection, CRM/webhook delivery, notification, success state, failure fallback).
- [ ] Every route has unique metadata, canonical, hreflang, and valid JSON-LD (validated in Rich Results Test).
- [ ] No component reads content except through the content repository interface.
- [ ] Both locales complete with no missing keys.
- [ ] All analytics events verified in GA4 DebugView; consent gating verified.
- [ ] Zero fabricated data; `CONTENT_TODO.md` lists all placeholders.
- [ ] README covers setup, env vars, content editing, CMS migration, deployment, and rollback.

## 20. Working Rules for You (the AI agent)

1. Ask at most **5 blocking questions** at the start; otherwise state your assumptions and proceed.
2. Prefer boring, proven solutions over novelty. Justify any added dependency in one line.
3. Keep components small, typed, and tested where logic exists.
4. Show trade-offs when you make a significant UX or architecture decision.
5. Never leave `TODO` in shipped code without a matching entry in `CONTENT_TODO.md` or an issue list.
6. If a requirement here conflicts with performance, accessibility, or legal compliance, flag it and propose the safer alternative.
