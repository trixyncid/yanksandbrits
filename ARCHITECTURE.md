# Architecture

Accepted and implemented in `src/`. Phases B through E are in the repo: foundation, home, inner pages, and the empty CMS-shaped routes. Phase F is partial. Unit tests, headers, and CI are present. Lighthouse CI and Playwright are not.

The plan below is still the source of truth.

The public website is not a content source. Company facts, programs, addresses, phone numbers, social links, articles, and photos from that site are out of scope. Section 0 of `landing-page-prompt.md` left almost every input blank. Those values ship as flagged placeholders until someone supplies them. The only filled geographic fact is the primary city: **Medan, North Sumatra, Indonesia**.

The implementation in `src/` follows this plan. Company facts stay as placeholders.

## Assumptions

1. **Identity is unknown.** Name, tagline, address, maps link, WhatsApp, email, phone, socials, logo, destination countries, metrics, domain, and CRM stay as `[REPLACE: …]` copy and empty settings. Nothing is inferred from the repo folder name or the public site.
2. **Product scope is the brief.** The site sells four programs: IELTS, TOEFL, Computer Science (study-abroad prep), and HSK. It also sells end-to-end university application support. The differentiator is education counsellors who monitor progress.
3. **Language.** The site is English only (changed from Bahasa Indonesia + English at the owner's request). URLs have no language prefix; old `/id/...` and `/en/...` URLs redirect permanently to the unprefixed page. Missing keys fail the build.
4. **Phase 1 content** is typed JSON/MDX validated with Zod, read only through a repository interface. No page imports a content file directly.
5. **Phase 2 CMS is built in this app** at `/admin`: Better Auth for sign-in, Prisma with PostgreSQL for storage, and Tiptap for the article editor. This replaces the earlier Payload plan at the owner's request. Articles are first; the other models below move into Prisma when they need editing.
6. **Package manager stays Bun** for this repo (`packageManager` is already Bun). Scripts in the README will show both `bun` and the `pnpm` equivalents the definition of done names. Switching package managers is not required to meet the stack.
7. **No brand assets.** Palette below is a proposal: trust (navy) and ambition (warm amber CTAs). Contrast pairs are specified for WCAG AA.
8. **No real photography, metrics, tutors, partners, or testimonials.** Sections still render, with visible `[REPLACE: …]` labels. Stock photos are not used as if they were the institute. Metrics are not animated from invented numbers.
9. **Lead destination** is a webhook (`LEAD_WEBHOOK_URL`) until `{{CRM}}` is chosen. Failed submits are stored locally and the UI falls back to WhatsApp. If WhatsApp is still a placeholder, the fallback says so and does not invent a number.
10. **Country landing pages** (`/study-abroad/[country]`) wait for Phase 2, after real destination countries exist.
11. **Dark mode** is out of v1.
12. **Deploy target** is Vercel, with a short Docker note in the README at handoff.

## Open questions

These five change the plan if the answers differ from the assumptions. Everything else proceeds as written.

1. **Legal name and domain.** Assumption: placeholders until provided. A real `EducationalOrganization` / `LocalBusiness` name, NAP, and canonical host cannot be published before this.
2. **WhatsApp number (E.164) and CRM.** Assumption: CTAs render, and the form explains that delivery is not configured. A live number and webhook are required before conversion tracking means anything.
3. **Which destination countries are real.** Assumption: the destination strip and country routes stay empty or placeholder until a verified list exists. No university logos.
4. **Brand assets.** Assumption: the palette in this document. If a logo and colors exist, Phase B uses those and re-checks contrast.
5. **Replace the current pages in place after this review.** Assumption: yes. Phase B deletes site-derived programs, copy, and contact facts and builds the information architecture below.

## Sitemap

No language prefix: marketing URLs are `/`, `/programs`, and so on. Old `/id/...` and `/en/...` URLs redirect permanently to the same path without the prefix.

| Path | Phase | Notes |
|---|---|---|
| `/` | C | Home, primary conversion page |
| `/programs` | D | Four programs |
| `/programs/ielts` | D | |
| `/programs/toefl` | D | |
| `/programs/computer-science` | D | Study-abroad prep, not a generic coding course |
| `/programs/hsk` | D | |
| `/study-abroad` | D | Application service and process |
| `/study-abroad/[country]` | E / later | Only after verified countries |
| `/counselling` | D | Counsellor loop and progress tracking |
| `/tutors` | E | Content layer |
| `/tutors/[slug]` | E | |
| `/expo` | E | |
| `/expo/[slug]` | E | Registration |
| `/articles` | E | Category, search, pagination |
| `/articles/[slug]` | E | |
| `/success-stories` | D | Placeholders until consented stories exist |
| `/about` | D | Story, team, accreditation, address as placeholders |
| `/contact` | D | Map facade, form |
| `/faq` | D | |
| `/privacy`, `/terms` | D | UU PDP. Marked as drafts pending legal review |
| `/design` | B | Component gallery instead of Storybook for v1 |
| `sitemap.xml`, `robots.txt`, `not-found`, `error` | B | Localized alternates |

**Navigation.** Sticky header: logo, Programs dropdown, Study Abroad, Tutors, EXPO, Articles, About, language switcher, primary CTA “Konsultasi Gratis” / “Free Consultation”. Mobile: full-screen drawer plus a sticky bottom bar (WhatsApp + Free Consultation).

**Legacy redirects.** `src/lib/seo/redirects.ts` is an empty map in Phase B. Entries are added only when old URLs are supplied. The public site is not crawled to invent that map.

## Design tokens

CSS variables in `src/styles/tokens.css`. Spacing is a 4/8 scale. Radius, shadow, and z-index are tokens, not one-off values. Type scale uses `clamp()`. Body is at least 16px, line-height 1.5–1.7, measure about 70ch.

**Color.** Navy signals trust. Amber is only for primary actions so one CTA wins per viewport.

| Token | Value | Use |
|---|---|---|
| `--color-brand` | `#102A43` | Header, hero, headings on light surfaces |
| `--color-brand-foreground` | `#FFFFFF` | Text on brand |
| `--color-accent` | `#9A3412` | Primary buttons. White label on this fill |
| `--color-accent-foreground` | `#FFFFFF` | |
| `--color-accent-soft` | `#FFF7ED` | Accent tint backgrounds |
| `--color-surface` | `#FFFFFF` | Page |
| `--color-surface-muted` | `#F4F6F8` | Alternating sections |
| `--color-ink` | `#102A43` | Body text |
| `--color-ink-muted` | `#3E4C59` | Secondary text |
| `--color-line` | `#D9E2EC` | Borders |
| `--color-success` | `#166534` | Success text on white |
| `--color-warning` | `#92400E` | Warning text on white |
| `--color-danger` | `#991B1B` | Error text on white |
| `--color-placeholder` | `#7C2D12` on `#FFF7ED` | `[REPLACE]` chips. Color is not the only signal; the label is text |

Contrast intent (WCAG AA, normal text): white on `#102A43`, white on `#9A3412`, `#102A43` on white, `#3E4C59` on white, `#166534` / `#92400E` / `#991B1B` on white. Phase B checks each pair with a contrast script before the tokens are treated as final. Placeholder chips use text, not color alone.

**Type.** Two families, self-hosted with `next/font`, `display: swap`, Latin subset.

- Display: Source Serif 4 (headings).
- Text: Source Sans 3 (UI and body).

**Breakpoints.** `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Layout is designed at 360px first.

**Motion.** Opacity and transform only, at most 300ms. `prefers-reduced-motion: reduce` disables scroll reveals and counters. Counters render the final number in HTML for SEO, then enhance.

## Component inventory

Built in Phase B–C and shown on `/design`.

| Component | Notes |
|---|---|
| Button, Link | Primary, secondary, ghost. 44px target |
| Input, Select, Checkbox | Labels and errors wired with ids |
| Modal / Drawer | Focus trap, Esc, return focus |
| Accordion, Tabs | FAQ and program detail |
| Stepper / Timeline | Desktop horizontal, mobile vertical |
| Cards | Program, tutor, article, event, testimonial |
| Stat | SSR number plus optional count-up |
| Badge, Breadcrumb, Pagination | |
| Toast, Skeleton | Empty, loading, error on every data list |
| Section | Shared rhythm, one primary CTA |
| CTA banner | Final conversion band |
| Floating WhatsApp | Avoids cookie banner and the bottom bar |
| Language switcher | Persists the path |
| Cookie banner | Granular consent, UU PDP |
| Lead form | Two-step, see conversion below |
| Desktop soft prompt | Once per session, desktop only, dismissible |

## Content models

Every document includes: `slug`, `locale`, `seo { title, description, ogImage, noindex }`, `publishedAt`, `updatedAt`, `status` (`draft` | `published`).

Repository (Phase B): `getPrograms`, `getProgram`, `getTutors`, `getTutor`, `getArticles`, `getArticle`, `getExpos`, `getExpo`, `getCounsellors`, `getStories`, `getPartners`, `getFaqs`, `getSettings`. Implementations live under `src/lib/content`. Components receive typed results only.

### Program

`name`, `category` (`language` | `academic`), `summary`, `outcomes[]`, `targetAudience`, `format` (`online` | `offline` | `hybrid`), `duration`, `schedule`, `level`, `syllabus[]`, `tutors[]` (refs), `faqs[]` (refs), `cta`.

Seed slugs: `ielts`, `toefl`, `computer-science`, `hsk`. Schedules use sample values. Prices are never shown on the site; fees are discussed in the free consultation.

### Tutor

`name`, `photo`, `role`, `subjects[]`, `bio`, `education[]`, `certifications[]`, `teachingExperience`, `notableResults`, `languages[]`, `featured`, `socials[]`.

No seed people. The home preview renders an empty state that says tutors are not published yet.

### Article

`title`, `excerpt`, `body`, `cover`, `category`, `tags[]`, `author` (tutor or counsellor ref), `readingTime` (computed), `relatedArticles[]`.

No seed articles copied from elsewhere. The preview empty state links to nothing external.

### Expo

`title`, `type`, `startDate`, `endDate`, `venue`, `city`, `description`, `universities[]`, `agenda[]`, `registration`, `gallery[]`, `eventStatus` (`upcoming` | `past`), `capacity`.

### Counsellor

`name`, `photo`, `bio`, `specialisations[]`, `countries[]`.

### Success story

`studentName`, `photo`, `program`, `scoreBefore`, `scoreAfter`, `university`, `country`, `quote`, `videoUrl`, `consent` (must be true to render).

### Partner

`name`, `country`, `logo`, `link`, `verified` (must be true to render a logo).

### FAQ

`question`, `answer`, `category`, `relatedProgram`. Eight to ten questions on duration, class size, online vs offline, guarantee policy (help-you-prepare language only), how the counsellor works, countries, scholarships, and parent involvement. Answers that depend on unknown facts use placeholders.

### Site settings

Contact, socials, default WhatsApp message, announcement bar, default SEO, tracking ids. All contact fields nullable.

### Phase 2 CMS

Done: `/admin` with Better Auth (email and password, no public sign-up), admin and editor roles, a dashboard, an article list, and a Tiptap editor with drafts, scheduled publish, cover image, and SEO fields. Articles are in PostgreSQL through Prisma (`prisma/schema.prisma`). See the README for setup.

Programs, tutors, counsellors, and sponsored campaigns are also in the CMS (`/admin/programs`, `/admin/tutors`, `/admin/counsellors`, `/admin/ads`), with image uploads served from `/media`. The public site reads them through a cached `getPrograms` and falls back to the bundled copy when the database is empty or absent.

Still open: public `/articles` reading from the database with tag-based revalidation, `draftMode()` preview, and moving expos, stories, and partners into the CMS.

## Home page (Phase C)

Each block is its own server component. One primary CTA per viewport.

1. Utility bar — next EXPO or intake, hidden when no dated item exists.
2. Hero — outcome H1, subhead naming the four programs and application support, Free Consultation, WhatsApp, trust strip of placeholders, one LCP image slot marked placeholder (no decorative stock presented as the school).
3. Destination strip — empty until verified partners exist.
4. Four program cards — audience, outcome, duration/format, level, “See program”, WhatsApp “Ask about this program” with prefilled text.
5. Proof — students, score change, offers, countries, years, counsellor ratio. Placeholder values, footnotes for definition and date. No count-up of fake numbers.
6. Counsellor difference — Assess → Plan → Learn → Monitor → Adjust → Apply. Example progress card labelled as an example.
7. Services — shortlisting, documents, essays, submission, scholarships, visa, pre-departure.
8. Journey — seven steps, who helps, typical timeline as placeholder where unknown.
9. Tutors preview — empty state.
10. Success stories — empty state. Video slot uses a click-to-load facade.
11. EXPO teaser — empty state.
12. Articles — empty state.
13. FAQ — accordion plus `FAQPage` JSON-LD.
14. Final CTA and lead form — “Free, no obligation” plus a reply-time line that stays `[REPLACE: reply time]` until confirmed.
15. Footer — address placeholder, hours placeholder, WhatsApp, socials, program links, legal, language switcher.

Persistent UI: floating WhatsApp, sticky mobile bar, desktop-only soft prompt (once per session).

## Conversion

Form fields: full name, WhatsApp (`+62` validation), email optional, education level, programs (multi), target country, target intake, notes optional, consent.

One step: name, WhatsApp, programs, consent. Hidden: UTM first- and last-touch, referrer, landing page, locale, device.

Server: Zod, honeypot, rate limit (in-memory fallback until Upstash), webhook, admissions email when configured, success state, WhatsApp continuation, queued failure log. No silent drop.

WhatsApp links: `https://wa.me/{number}?text=...` with page and program context. Clicks go through `track`.

Events (typed `track`): `cta_click`, `whatsapp_click`, `lead_form_start`, `lead_form_submit`, `program_view`, `tutor_view`, `expo_register_click`, `article_read_50`, `article_read_90`, `faq_expand`, `language_switch`, `scroll_depth`. GA4 loads only after consent.

## SEO and privacy

- Server-rendered marketing content.
- `generateMetadata` on every route: title ≤ 60, description ≤ 155, canonical, Open Graph, Twitter, `next/og` image.
- JSON-LD: organization (only filled NAP fields), `Course`, `Person`, `Event`, `Article`, `FAQPage`, `BreadcrumbList`. No `AggregateRating` without real reviews.
- Dynamic sitemap and robots with localized alternates.
- One `h1`, landmarks, skip link, breadcrumbs on deep pages.
- City copy may say Medan and Sumatera Utara. It may not invent a street.
- Security headers, consent banner, privacy and terms drafts, consent flag before any student photo or quote.

## Performance and accessibility

Home JS target under 150 KB gzipped. LCP image under 120 KB and preloaded when a real asset exists. Maps and video are facades. Motion and third parties stay off the critical path.

Lighthouse mobile targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100. Field goals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

WCAG 2.2 AA: keyboard, focus, 44px targets, reduced motion, form errors, axe in CI.

## Structure (Phase B onward)

```
src/app/[locale]/(marketing)/
src/components/{ui,sections,cards,forms,layout,seo}
src/content
src/lib/{content,cms,auth,analytics,seo,validation,utils}
src/app/admin            # CMS, its own root layout
src/components/admin
prisma/{schema.prisma,migrations,seed.ts}
src/actions
src/styles
messages/{id.json,en.json}
tests/{unit,e2e}
```

`CONTENT_TODO.md` lists every placeholder. A `TODO` in code without that entry is a defect.

## Risks

| Risk | Response |
|---|---|
| Publishing the current pages as if they were this product | Phase B replaces them. Do not polish site-derived copy. |
| Empty pages feel unfinished | Empty states are designed and labelled. They are not filled with invented proof. |
| LocalBusiness schema with a fake address | Emit only fields that are real. City can be Medan. Street stays off until supplied. |
| Guarantee language | Copy says the team helps students prepare and apply. No guaranteed scores or admission. |
| CMS scope creep | The CMS covers articles first. Other models stay in `src/lib/content` until editors need them. |
| `pnpm build` in the definition of done vs Bun in the repo | Document both. CI uses the repo’s package manager. |
| Third-party scripts vs the performance budget | Consent-gated, `lazyOnload`. Lighthouse CI fails the build under the thresholds. |

## Phase gate

Phase A is this document. Implementation starts at Phase B only after this plan is accepted.

| Phase | Output |
|---|---|
| A | This file |
| B | Scaffold, tokens, layout, i18n, content repository, SEO helpers, analytics wrapper, CI |
| C | Home and conversion |
| D | Programs, study abroad, counselling, about, contact, FAQ, legal, success stories |
| E | Tutors, EXPO, articles, sitemap JSON-LD, CMS notes |
| F | A11y, performance, e2e, headers, README handoff |
