# Sponsored placements

The site sells sponsored placements directly to education partners: universities, test centres, banks, insurers, student housing. Every placement carries a visible **Sponsored** label. A placement with nothing booked renders nothing, so pages never show gaps or "advertise here" boxes.

Campaigns are managed in the CMS at **/admin/ads**. There is no code change or deploy per campaign.

## Where ads appear

Ads run in **two places only**:

1. the **Home hero banner**, as extra slides after the site's own first slide
2. the **Study abroad university directory**, as sponsored university listings

Nothing else on the site carries advertising: not the header or navigation, the **first** hero slide, the Home page's university section, articles, programs, Expo, the footer, the Contact page, the consultation form or WhatsApp popup, the mobile bottom bar, or the Counsellors and Tutors pages.

No popups, overlays, autoplay, or sticky ads.

## Placements

| Slot id | Page and position | Format | Limit on any day |
|---|---|---|---|
| `home-hero` | Home hero, as extra slides after the site's own slide | hero | 3 |
| `universities` | Rows in the Study abroad university directory, filtered by country | university | No limit |

The site keeps a single hero slide of its own. With no live hero campaign, the hero is still: no arrows, no indicators. Once a campaign is live, the hero becomes a carousel with arrows and indicators, and it crossfades to the next slide every 7 seconds. It pauses while the visitor hovers, focuses inside it, switches tabs, or presses pause, and it never moves on its own for visitors who ask their device for reduced motion.

The CMS refuses to activate a campaign that would push the hero banner over its limit on any day of its run, and names the campaigns it clashes with. Every live campaign in a placement is shown, so there is no rotation weight.

### Retired placements

Earlier versions also sold a Home feature card, a Home card, a Study abroad pinned row, program pages, an articles row, and Expo and footer partner logos. Those are gone. Campaigns saved with them keep their record: the site ignores the retired placements, the campaign list says so when a campaign has nothing left to show in, and the editor drops them on the next save.

## University advertising

Pick **University** as the advertiser type to add:

- **Country and city.** The country adds a tab to the Study abroad country filter, if it is not there already. Visitors who pick that country see the university first.
- **Majors.** Shown as tags on the listing, so students can see at a glance whether the university teaches their subject.

Only university advertisers can book the `universities` placement. A university can also book a hero banner. Other brands can book the hero banner only.

## Creative specs

Upload images in the campaign editor. They are stored by the site and served from its own domain; images hosted elsewhere are blocked by the site's security policy. JPG, PNG, WebP, or AVIF, up to 5 MB. The editor warns when an image is smaller than recommended or a different shape.

| Format | Image | Logo |
|---|---|---|
| hero | Required, 16:9, at least 1920×1080. Keep the left 45% calm: the text sits there on a dark gradient | Not used |
| university | Required, 3:2 or 16:10, at least 1200 wide | Optional, transparent PNG |

A campaign booked in both places uses one image, so crop for the hero (16:9) and keep the subject centred.

Copy is written in **English**:

- title: up to 60 characters
- body: up to 140 characters
- button text: up to 24 characters

Links must be `https`.

## What is accepted

- Education-related brands only.
- No competing consultancies.
- No promises of admission, scores, or visas. This matches the site's own rule.
- Image text and claims must be true and current.

## Running a campaign

1. **Ads → New campaign.** Choose University or Other brand.
2. Fill in the advertiser, the link, and, for a university, the country, city, and majors.
3. Tick the placements: hero banner, Study abroad universities, or both.
4. Set the start and end dates (Medan time, both days included).
5. Upload the banner (and, for a university listing, an optional logo), then write the copy. Check the preview of each placement.
6. **Activate.** The campaign appears on its start date and disappears after its end date with no further action. **Pause** takes it down at once and keeps it for later.

Editors and admins can create and change campaigns. Only admins can delete one; pausing is usually better, because it keeps the record.

## Reporting

Each sponsor can be shown two independent sets of numbers:

- **Site analytics (GA4)**, for visitors who accepted analytics cookies:
  - `ad_impression` (slot, campaign) is a *viewable* impression: at least half the card on screen for one full second, counted once per page view. A hero slide counts once it has been the active slide for one second.
  - `ad_click` (slot, campaign).
  - Filter by `campaign` (the campaign id) for a sponsor's report. Click-through rate is clicks ÷ impressions.
- **The sponsor's own analytics.** Every link carries:
  - `utm_source=<site domain>`
  - `utm_medium=sponsored`
  - `utm_campaign=<campaign id>`
  - `utm_content=<slot id>`

  Tags the sponsor already put on their URL are kept.

Analytics only count visitors who consent, so impressions are a floor, not a total. Say so in reports.
