# Leads

How a consultation request travels from the website to a counsellor.

```
Website form ──► lead table (PostgreSQL) ──► CMS › Leads ──► Excel export ──► counsellors
 (Contact page,      one row per family        search, filter,     assignment, status,
  WhatsApp popup)    per week                  view, delete        follow-up, workload
```

## 1. On the website

Both forms use `LeadForm` (`src/components/forms/lead-form.tsx`):

| Form | Where | Recorded as |
|---|---|---|
| Contact page | `/contact` | `origin = contact` |
| WhatsApp popup | Shown before a WhatsApp chat opens | `origin = whatsapp` |

- One short step: name, WhatsApp number, programs, and consent. Once the lead is in the database the visitor sees a thank-you promising contact within one business day. From the WhatsApp popup, WhatsApp then opens with the message ready and the visitor's name in it.
- **Attribution** is captured on the first page of the visit (`src/lib/analytics/attribution.ts`), so a lead is credited to the ad or search that brought the visitor in, not the page they submitted on. Last-touch and first-touch UTM tags, the entry referrer, and the landing page are stored. `src/lib/leads/channel.ts` turns them into a channel close to GA4's default grouping (Paid search, Paid social, Organic search, and so on).

Tag every paid link with UTM parameters, for example
`?utm_source=instagram&utm_medium=paid_social&utm_campaign=ielts-oct-2026&utm_content=reel-a`.
Without `utm_medium`, a paid click can only be classed from its referrer.

### Protection

- **Duplicates:** the same WhatsApp number within 7 days updates the existing lead (programs are merged, "Times submitted" goes up, the original source keeps the credit). One family is one row, so it is never handed to two counsellors.
- **Spam:** a hidden honeypot field, and at most 8 new leads per connection per hour. Visitor IPs are stored only as a salted hash (`LEAD_IP_SALT`, falling back to `BETTER_AUTH_SECRET`).
- **Double clicks** within 30 seconds are ignored.
- If the database is down, the visitor is told it could not be sent and can try again or use WhatsApp. Nothing is silently dropped.

### Optional notification

Set `LEAD_WEBHOOK_URL` (and `LEAD_WEBHOOK_SECRET`) to also POST each new lead as JSON, e.g. to a Slack or email automation. It runs after the visitor's response, so a slow or failing webhook never affects the form; failures are logged and `deliveredAt` stays empty.

## 2. In the CMS

**Growth › Leads** (`/admin/leads`) — every signed-in CMS user.

- The sidebar badge counts leads **waiting for a counsellor**.
- **Assign:** tick leads (or the header box for the whole page), pick a counsellor, and choose **Assign and alert**. The counsellor gets one WhatsApp message listing their new leads with tap-to-chat links ([setup](whatsapp-gateway.md)). The counsellor list shows how many leads each was given in the last 30 days, and flags anyone away or without a WhatsApp number. **Unassign** puts leads back in the pile.
- Each lead shows its counsellor and whether the alert went out. A lead's page can reassign, retry a failed alert, or open the alert in your own WhatsApp when the gateway is unavailable.
- **Excel-style columns:** each header opens a menu. Received and Name sort; Programs, Counsellor (including *Unassigned*), Channel, and Form filter by ticking values, with counts that follow the other filters. The view lives in the URL, so it can be bookmarked or shared. Search (name, number, campaign) and the date range sit above the table.
- **Export** downloads the current view as Excel, with each lead's CMS counsellor and assignment date filled in. Each export is logged on the server (who, how many rows, which filters).
- **Delete** is admin-only and permanent. Use it for erasure requests under Indonesia's Personal Data Protection Law (UU PDP).

Counsellors' alert numbers are set in **People › Counsellors › Lead alerts**. They are private and never reach the public site.

## 3. The Excel workbook

Built by `src/lib/leads/workbook.ts`. Opens in Excel 2016+, Google Sheets, and LibreOffice.

| Sheet | What it is for |
|---|---|
| **Leads** | One row per lead. Distribution columns (shaded): Assigned counsellor (dropdown), Assigned on, Status (dropdown), Next follow-up, Counsellor notes. WhatsApp numbers open a chat. Filters and frozen headers are on. |
| **Counsellors** | Names from the CMS (add or remove freely). Live workload: assigned, open, contacted, consultations, enrolled, enrolment rate, follow-ups due. **Next in line** suggests who should get the next lead (lightest open load). |
| **Summary** | Live totals: unassigned, still new, contact rate, consultations, enrolments, and results by channel, campaign, program, and form. |
| **How to use** | The daily routine, status meanings, colour key, and data-handling rules. |

Highlights: red Age and name = still New after a day; amber counsellor cell = unassigned; orange follow-up = due; red Lead ID = duplicated row.

**Statuses:** New → Contacted → Consultation booked → Enrolled, plus No response (still open), Not interested, and Invalid number (closed).

**Keeping one working file:** assign in the CMS, then export; the workbook is for status, follow-ups, and notes, and those edits do not go back to the CMS. To add newer leads, export a short range (e.g. Last 7 days), copy the rows whose Lead ID is not already in the working file, and paste them under the last row. Dropdowns, highlights, and totals cover 5,000 extra rows.

## For developers

| Piece | File |
|---|---|
| Schema | `prisma/schema.prisma` (`Lead`), migrations `*_leads*` and `*_lead_assignment` |
| Form actions | `src/actions/lead.ts` |
| Saving, merging, rate limit, webhook | `src/lib/leads/store.ts` |
| Assignment and counsellor alerts | `src/lib/leads/assign.ts`, `src/lib/leads/alert.ts`, `src/lib/whatsapp/gateway.ts` |
| URL filters (shared with the browser) | `src/lib/leads/filters.ts` |
| CMS queries and filters | `src/lib/cms/leads.ts` |
| Pages | `src/app/admin/(cms)/leads/` (list, `[id]`, `export/route.ts`) |
| Tests | `tests/unit/leads.test.ts`, `tests/unit/assignment.test.ts` |

Workbook formulas avoid `COUNTIF(range,"<>")` and `"?*"`: spreadsheet apps disagree on how those treat empty cells. "Not blank" is written as `COUNTA` or a `SUMPRODUCT` comparison. Data validation is added once per column range, because ExcelJS's per-cell merging writes overlapping ranges that make Excel offer to repair the file.

Before this table existed, leads went to `.data/lead-queue.jsonl` on the server. Anything there was never imported; check that file on any server that ran the old version.
