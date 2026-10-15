# Content still to supply

The site shows no placeholders: anything not supplied is left out. `tests/unit/content.test.ts` fails if a `[REPLACE` marker or "sample" wording returns to the copy, and `bun run content:clean-samples` removes old sample records from a database.

## Settings (environment)

- `NEXT_PUBLIC_SITE_URL`: the staging or production address. Staging also sets `NEXT_PUBLIC_NOINDEX=true`.
- `NEXT_PUBLIC_WA_NUMBER`: WhatsApp buttons fall back to the form until it is set.
- `NEXT_PUBLIC_TAGLINE`: left out of the footer until set.
- `NEXT_PUBLIC_INSTAGRAM`, `NEXT_PUBLIC_TIKTOK`, `NEXT_PUBLIC_YOUTUBE`, `NEXT_PUBLIC_FACEBOOK`: full profile URLs; each icon appears once set.
- `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_PHONE`: used in search-engine data only.

## In the CMS

- Counsellors: publish real profiles (the Counselling page leaves the team out until there is one), with private WhatsApp numbers for lead alerts.
- Tutors: real profiles. "John Doe" was unpublished as a placeholder.
- Programs: duration and timetable per program, once confirmed (hidden while empty).
- FAQ: four questions were rewritten without sample figures and are still hidden; review and publish them.
- Testimonials and student stories, with written consent.
- Expo dates and venues.
- Articles.
- Homepage key figures and badge (hidden until filled).

## Outside the site

- Legal review of the privacy policy and terms (both say "Pending legal review").
- WhatsApp gateway for counsellor alerts (`docs/whatsapp-gateway.md`).
- Turnstile site key if spam checks should run in production.
