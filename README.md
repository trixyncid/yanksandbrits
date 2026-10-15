# Education site, Medan

Marketing site for an education consultancy in Medan. The site is in English, with no language prefix in its URLs. Old `/id/...` and `/en/...` addresses redirect permanently to the same page without the prefix.

Company facts that were not supplied are left off the page rather than shown as placeholders; what is still missing is listed in `CONTENT_TODO.md`. The public website of any previous brand is not a source for this project.

## Scripts

```bash
bun install
bun dev
bun test
bun run lint
bun run typecheck
bun run build
```

Open [http://localhost:3000](http://localhost:3000). `/` redirects to `/id` or `/en` from the browser language.

`pnpm` equivalents: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm build`. This repo pins Bun in `packageManager`.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical host. Empty disallows robots |
| `NEXT_PUBLIC_NOINDEX` | `true` on staging and previews: keeps search engines out even with a domain set |
| `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_TAGLINE`, social URLs, `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_PHONE` | Identity. The name defaults to "Yanks and Brits"; anything empty is left off the page |
| `NEXT_PUBLIC_WA_NUMBER` | Digits only. Empty means WhatsApp buttons go to the form |
| `LEAD_WEBHOOK_URL` | Optional. Also POSTs each new lead as JSON (Slack, email automation). Leads are saved in the database either way |
| `LEAD_WEBHOOK_SECRET` | Optional bearer token for the webhook |
| `LEAD_IP_SALT` | Optional salt for hashed visitor IPs used in rate limiting. Defaults to `BETTER_AUTH_SECRET` |
| `WA_GATEWAY_URL`, `WA_GATEWAY_USERNAME`, `WA_GATEWAY_PASSWORD`, `WA_GATEWAY_DEVICE_ID` | Optional. Self-hosted GOWA gateway that alerts counsellors on WhatsApp when leads are assigned. See [docs/whatsapp-gateway.md](docs/whatsapp-gateway.md) |
| `NEXT_PUBLIC_GA_ID` | GA4. Loads only after analytics consent |
| `TURNSTILE_SECRET_KEY` | Reserved. The widget is not mounted until a site key is added |
| `DATABASE_URL` | PostgreSQL for the CMS |
| `BETTER_AUTH_SECRET` | Signs CMS sessions. Required at runtime |
| `BETTER_AUTH_URL` | Public origin of the app, for example `http://localhost:3000` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Read only by `bun run db:seed` |

Consultation requests are saved to the `lead` table and shown in the CMS under **Leads**, with an Excel export for distributing them to counsellors. See [docs/leads.md](docs/leads.md).

## CMS

The admin lives at `/admin`. It uses Better Auth (email and password), Prisma with PostgreSQL, and a Tiptap editor.

First run:

```bash
cp .env.example .env.local      # set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ADMIN_*
bun install                     # also runs `prisma generate`
bun run db:migrate              # creates the tables
bun run db:seed                 # first admin, plus the bundled programs and sample counsellors
bun dev                         # open /admin/login
```

Generate the secret with `openssl rand -base64 32`. Remove `ADMIN_PASSWORD` from `.env.local` after seeding. Running the seed again with an existing email only promotes that account to admin.

| Route | Who | What |
|---|---|---|
| `/admin/login` | Anyone | Sign in. Public sign-up is off |
| `/admin` | Editors, admins | Counts, recently edited, scheduled queue |
| `/admin/homepage` | Editors, admins | Every headline, paragraph, photo, and key figure on the home page. Saving publishes at once |
| `/admin/articles` | Editors, admins | Filter by status, search, paginate. Published English articles appear on the home page, `/articles`, and `/articles/[slug]` |
| `/admin/articles/new`, `/admin/articles/[id]` | Editors, admins | Tiptap editor, draft / publish / schedule, cover, SEO |
| `/admin/programs` | Editors, admins | Order programs, publish or hide them |
| `/admin/programs/new`, `/admin/programs/[id]` | Editors, admins (delete: admins) | Name, headline, facts, outcomes, learning path, image, SEO |
| `/admin/testimonials` | Editors, admins (delete: admins) | Quotes for the home page, with optional photo, order, publish or hide. Publish only with written consent |
| `/admin/tutors`, `/admin/counsellors` | Editors, admins (delete: admins) | Profiles with photo upload, English text, order, publish or hide |
| `/admin/stories` | Editors, admins (delete: admins) | Student stories for `/success-stories`: quote, story, program, score before and after, destination, intake, photo, featured. Cannot be published until written consent is recorded |
| `/admin/faqs` | Editors, admins (delete: admins) | Questions for `/faq`, grouped by category. Choose program pages to show them on, and which appear on the Contact page |
| `/admin/expos` | Editors, admins (delete: admins) | The lineup on `/expo`: date and time (empty = awaiting confirmation), venue, topics, photo, optional registration link, order, publish or hide. The next dated expo also shows on the home page |
| `/admin/ads` | Editors, admins (delete: admins) | Sponsored campaigns: Home hero banner and Study abroad university listings only. See `docs/sponsorship.md` |
| `/admin/users` | Admins | Create and remove accounts |
| `/admin/account` | Everyone signed in | Change password, sign out |

How it fits together:

- `src/proxy.ts` redirects to the login page when there is no session cookie. That is only an optimistic check. Every page and server action calls `requireUser()` or `requireAdmin()` from `src/lib/auth/session.ts`, which checks the session in the database.
- Article bodies are stored as Tiptap JSON (`content`). The server re-validates the JSON, strips unsafe links and image URLs, and renders `contentHtml` on every save with `@tiptap/static-renderer`. Render `contentHtml` on the public site; do not render client HTML.
- New articles are English. Older Bahasa articles stay in the CMS, marked "Bahasa · not on site", until they are translated and switched to English or deleted. `(locale, slug)` is unique.
- A published article with a future date counts as scheduled.
- Editors and admins can both publish. Only an admin or the author can delete an article. Removing a user keeps their articles without an author.
- Images are uploaded in the CMS (JPG, PNG, WebP, or AVIF, up to 5 MB). They are stored in Postgres and served from `/media/<id>` with a one-year immutable cache, so they pass the same-origin image policy and work on hosts with a read-only filesystem. Files under `public/images` can also be picked from the library. Article inline images still take a URL.

Programs:

- The public site reads programs through `getPrograms(locale)` in `src/lib/programs`. It feeds the nav, footer, home showcase, program list, program pages, and the lead form options.
- Results are cached with the `programs` tag. Saving, hiding, reordering, or deleting a program in the CMS refreshes every page that uses them.
- If `DATABASE_URL` is empty, the database is unreachable, or the `program` table is empty, the site falls back to the bundled copy in `src/content`. `bun run db:seed` imports that copy into the CMS once.
- Build with `DATABASE_URL` set so the prerendered program pages use CMS content. Programs created after a build render on first request.
- FAQ targeting still uses the four bundled slugs. A new program shows the general FAQs. Sponsored campaigns can target any program from the CMS.

Tutors and counsellors:

- One record per person; role, bio, and lists are written in English. Older records may still hold Bahasa text, which is ignored and dropped on the next save.
- `getCounsellors` and `getTutors` in `src/lib/people` are cached with the `counsellors` and `tutors` tags. Until the CMS has counsellors, the Counselling page shows the bundled samples. The Tutors page shows its "coming soon" gallery until a tutor is published.
- Tutor profile pages (`/tutors/[slug]`) read the tutor at request time. Their slugs are not prerendered, and in Next.js 16.4 the first render of such a page after a CMS save could still see the previous cached list. Program pages do the same lookup when the cached list misses a slug.

Ads:

- Campaigns live in the `ad` table. `getSponsors` in `src/lib/sponsors` reads active ones through a cache tagged `ads`; start and end dates are checked in the browser in Medan time, so cached pages still switch campaigns on and off on the right day.
- The home hero adds sponsored slides after the site's first slide. University campaigns appear in the Study abroad university directory and follow its country filter. No other placements exist.

The public `/articles` pages still read from `src/lib/content` and do not show CMS articles yet. Connecting them is the next step: read published rows (`status = published` and `publishedAt <= now`) in a cached function and render `contentHtml` with the `.article-prose` styles in `src/styles/admin.css`.

Deploy: run `bun run db:deploy` against the production database before starting the new build. The build itself does not need a database.

## Image storage (DigitalOcean Spaces)

Uploaded images go to a private DigitalOcean Space when `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET`, and `DO_SPACES_REGION` are set (see `.env.example`). Without them, files are stored in the database, which is fine for local development.

- Visitors always load `/media/<id>`. The app streams the file from Spaces, so stored image URLs, the security policy, and image optimisation do not change. Files never change under the same id, so responses are cached for a year.
- Objects are private and grouped by month: `<folder>/2026/10/<random>.jpg`. Set `DO_SPACES_FOLDER` to keep staging and production apart in one Space.
- Setting only some of the variables is an error, so a typo never quietly falls back to the database.

To move files uploaded before Spaces was set up:

```bash
bun run media:to-spaces --dry-run   # list what would move
bun run media:to-spaces             # copy, check each file's size in Spaces, then clear it from the database
bun run media:to-spaces --keep-data # copy but keep the database bytes as well
```

It is safe to run again; files already in Spaces are skipped.

## Content

The home page has no hard-coded content: it reads the `home` record in `site_content` (Homepage editor), plus programs, testimonials, published articles, the next expo, and hero ads. `/expo` reads its lineup from the `expo` table; `/expo/<slug>` redirects to that expo's section. A section with nothing in the CMS is left out, never filled with samples. `bun run db:seed` stores the starting homepage content once.

Page copy lives in `src/content/en.ts`. `messages/en.json` is the same object for `next-intl`. Regenerate it after a copy edit:

```bash
bun -e 'import { en } from "./src/content/en.ts"; await Bun.write("messages/en.json", JSON.stringify(en, null, 2) + "\n");'
```

The app still has an internal `[locale]` route segment and passes `locale` around, but its only value is `en` and it never appears in a URL.

Programs, FAQs, tutors, articles, expos, stories, and partners are read through `src/lib/content`. Pages do not import the content files directly. The CMS (see above) will replace these reads one model at a time, starting with articles.

## Measurement

| Event | When |
|---|---|
| `cta_click` | Navigation and prompt clicks |
| `whatsapp_click` | WhatsApp control, with page and program |
| `lead_form_start` | First edit of the form |
| `lead_form_submit` | Success or failure |
| `faq_expand` | FAQ open |
| `language_switch` | Locale link |
| `scroll_depth` | 25 / 50 / 75 / 90 |

`program_view`, `tutor_view`, `expo_register_click`, and `article_read_50/90` are in the typed helper for when those records exist. Analytics runs only after consent.

## Deploy

Vercel: set the env vars, then deploy. `bun run build` is the production build. It points `SWC_NATIVE_BINDING_CACHE` at `/tmp` because SWC (loaded by the next-intl plugin) refuses to unpack its native binary under Vercel's default `/vercel/.cache`; elsewhere SWC falls back to the user cache.

Docker: the app starts with `bun run build` and `bun start` on port 3000. Use `oven/bun:1.3.5`, copy the lockfile, and run `bun install --frozen-lockfile` before the build. A managed host is the simpler path until a standalone output is turned on.

## Still open

Lighthouse CI, Playwright, and a browser axe pass are not in this repo yet. Legal pages are drafts. See `CONTENT_TODO.md` and `ARCHITECTURE.md`.
