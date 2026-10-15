"use client";

import { ArrowUpRight, GalleryHorizontal, GraduationCap, LoaderCircle, MapPin, Megaphone, Pause, Play, Save, type LucideIcon } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteAdAction, saveAdAction } from "@/actions/cms";
import { slugify } from "@/lib/cms/document";
import type { AdInput } from "@/lib/sponsors/schema";
import { formatSpecs, slotIds, sponsorSlots, type SponsorSlotId } from "@/lib/sponsors/slots";
import { cn } from "@/lib/utils";
import { CountryPicker, type CountryOption } from "./country-picker";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, ChipsInput, DeleteButton, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { panel, primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

type Copy = { title: string; body: string; cta: string };

export type AdDraft = {
  id: string | null;
  slug: string;
  advertiser: string;
  kind: "university" | "brand";
  country: string;
  city: string;
  majors: string[];
  slots: SponsorSlotId[];
  programs: string[];
  startsOn: string;
  endsOn: string;
  active: boolean;
  weight: number;
  href: string;
  image: string;
  logo: string;
  copy: { en: Copy };
  updatedAt: string | null;
};

function todayWib() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function stateOf(draft: AdDraft) {
  const today = todayWib();
  if (!draft.active) return { label: "Paused", tone: "muted" as const };
  if (draft.endsOn && draft.endsOn < today) return { label: "Ended", tone: "warning" as const };
  if (draft.startsOn && draft.startsOn > today) return { label: "Scheduled", tone: "brand" as const };
  return { label: "Live", tone: "success" as const };
}

const slotIcons: Record<SponsorSlotId, LucideIcon> = {
  "home-hero": GalleryHorizontal,
  universities: GraduationCap,
};

export function AdEditor({
  initial,
  countries,
  suggested,
  retired = [],
  canDelete,
}: {
  initial: AdDraft;
  countries: CountryOption[];
  /** ISO codes listed first in the country dropdown. */
  suggested: string[];
  /** Placements this campaign was booked into that the site no longer has. */
  retired?: string[];
  canDelete: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<AdDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setErrors((current) => {
      const copy = { ...current };
      for (const key of Object.keys(next)) delete copy[key];
      return copy;
    });
    setDirty(true);
  };
  // The site is English only, so campaigns carry English copy alone.
  const copy = draft.copy.en;
  const setCopy = (next: Partial<Copy>) => patch({ copy: { en: { ...copy, ...next } } });
  const copyError = (field: keyof Copy) => errors[`copy.en.${field}`];

  function setKind(kind: AdDraft["kind"]) {
    patch({
      kind,
      slots: kind === "university" ? draft.slots : draft.slots.filter((slot) => slot !== "universities"),
    });
  }

  function toggleSlot(slot: SponsorSlotId, on: boolean) {
    const slots = on ? [...draft.slots, slot] : draft.slots.filter((item) => item !== slot);
    patch({ slots: slotIds.filter((id) => slots.includes(id)) });
  }

  function save(active: boolean) {
    const input: AdInput = { ...draft, active, href: draft.href.trim() };
    startTransition(async () => {
      const result = await saveAdAction(input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({
        ...current,
        id: result.id,
        active,
        updatedAt: result.updatedAt,
      }));
      setErrors({});
      setDirty(false);
      setSlugTouched(true);
      const state = stateOf({ ...draft, active });
      toast({
        tone: "success",
        text: !active
          ? "Saved and paused. Nothing shows on the site."
          : state.label === "Scheduled"
            ? `Saved. It goes live on ${draft.startsOn}.`
            : state.label === "Ended"
              ? "Saved, but the end date has passed, so it is not shown."
              : "Saved. The campaign is live on the site.",
      });
      if (wasNew) window.history.replaceState(null, "", `/admin/ads/${result.id}`);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.active);
    }
  }

  const hero = draft.slots.includes("home-hero");
  const listing = draft.slots.includes("universities");
  // The hero slide is the stricter crop, so it sets the size when both are booked.
  const imageSpec = hero ? formatSpecs.hero.image : listing ? formatSpecs.university.image : undefined;
  const university = draft.kind === "university";

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      <SaveBar status={stateOf(draft)} pending={pending} dirty={dirty} saved={Boolean(draft.updatedAt)}>
        {draft.active ? (
          <button type="button" disabled={pending} onClick={() => save(false)} className={secondaryAction}>
            <Pause className="size-4" aria-hidden="true" />
            Pause
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={() => save(false)} className={secondaryAction}>
            <Save className="size-4" aria-hidden="true" />
            Save paused
          </button>
        )}
        <button type="button" disabled={pending} onClick={() => save(true)} className={primaryAction}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : draft.active ? (
            <Save className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {draft.active ? "Update" : "Activate"}
        </button>
      </SaveBar>
      {retired.length ? (
        <p className="bg-cms-blue-10 text-cms-ink/80 mb-4 rounded-2xl px-4 py-3 text-sm leading-6">
          This campaign was also booked for {retired.join(", ")}. Those placements were retired, so it no longer shows there. Saving keeps only the placements ticked below.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card title="Advertiser" description="Who is paying for this placement, and where the button sends visitors.">
            <div role="radiogroup" aria-label="Advertiser type" className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "university",
                    title: "University",
                    body: "Listed on Study abroad by country, with its majors. Can also run a hero banner.",
                    icon: GraduationCap,
                  },
                  {
                    value: "brand",
                    title: "Other brand",
                    body: "Test centres, banks, insurers, housing, and similar partners. Hero banner only.",
                    icon: Megaphone,
                  },
                ] as const
              ).map(({ value, title, body, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={draft.kind === value}
                  onClick={() => setKind(value)}
                  className={cn(
                    "flex gap-3 rounded-xl border p-4 text-left transition-colors",
                    draft.kind === value ? "border-cms-blue bg-cms-blue-10/50 ring-cms-blue/15 ring-2" : "border-cms-field hover:border-cms-blue/40",
                  )}
                >
                  <Icon className="text-cms-blue mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-cms-ink/60 block text-xs leading-5">{body}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="advertiser" label={university ? "University name" : "Advertiser"} error={errors.advertiser}>
                <Input
                  id="advertiser"
                  maxLength={80}
                  value={draft.advertiser}
                  onChange={(event) => {
                    const advertiser = event.target.value;
                    patch({
                      advertiser,
                      ...(slugTouched
                        ? {}
                        : {
                            slug: slugify(`${advertiser} ${draft.startsOn.slice(0, 4)}`),
                          }),
                    });
                  }}
                  aria-invalid={Boolean(errors.advertiser)}
                  aria-describedby={describedBy("advertiser", errors.advertiser)}
                />
              </Field>
              <Field id="slug" label="Campaign id" hint="Shows in analytics and UTM tags." error={errors.slug}>
                <Input
                  id="slug"
                  value={draft.slug}
                  spellCheck={false}
                  onChange={(event) => {
                    setSlugTouched(true);
                    patch({
                      slug: slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : ""),
                    });
                  }}
                  aria-invalid={Boolean(errors.slug)}
                  aria-describedby={describedBy("slug", errors.slug, true)}
                />
              </Field>
            </div>
            <Field id="href" label="Link" hint="Full https:// address. UTM tags are added automatically." error={errors.href}>
              <Input
                id="href"
                type="url"
                inputMode="url"
                value={draft.href}
                onChange={(event) => patch({ href: event.target.value })}
                placeholder="https://www.university.edu/apply"
                aria-invalid={Boolean(errors.href)}
                aria-describedby={describedBy("href", errors.href, true)}
                spellCheck={false}
              />
            </Field>
            {university ? (
              <div className="bg-cms-field grid gap-4 rounded-xl p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="country" label="Country" hint="Matches the country filter on the site." error={errors.country}>
                    <CountryPicker
                      id="country"
                      value={draft.country}
                      onChange={(country) => patch({ country })}
                      countries={countries}
                      suggested={suggested}
                      invalid={Boolean(errors.country)}
                      describedBy={describedBy("country", errors.country, true)}
                    />
                  </Field>
                  <Field id="city" label="City" error={errors.city}>
                    <Input id="city" maxLength={60} value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
                  </Field>
                </div>
                <Field id="majors" label="Majors" hint="Press Enter or comma to add. Shown as tags on the listing. Up to 20." error={errors.majors}>
                  <ChipsInput id="majors" values={draft.majors} max={20} onChange={(majors) => patch({ majors })} placeholder="Computer Science, Business, Engineering" describedBy="majors-hint" />
                </Field>
              </div>
            ) : null}
          </Card>

          <Card title="Placements" description="Ads run in two places only: the Home hero banner and the Study abroad university directory.">
            {errors.slots ? <p className="text-danger text-sm">{errors.slots}</p> : null}
            <ul className="grid gap-3 sm:grid-cols-2">
              {slotIds.map((slot) => {
                const info = sponsorSlots[slot];
                const Icon = slotIcons[slot];
                const disabled = slot === "universities" && !university;
                const checked = draft.slots.includes(slot);
                return (
                  <li key={slot}>
                    <label
                      className={cn(
                        "flex h-full gap-3.5 rounded-2xl border p-4 transition-colors",
                        checked ? "border-cms-blue bg-cms-blue-10/50 ring-cms-blue/15 ring-2" : "border-cms-gray-25",
                        disabled ? "opacity-50" : "hover:border-cms-blue/40 cursor-pointer",
                      )}
                    >
                      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(event) => toggleSlot(slot, event.target.checked)} />
                      <span
                        className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition-colors", checked ? "bg-cms-blue text-white" : "bg-cms-field text-cms-blue")}
                        aria-hidden="true"
                      >
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold">{info.label}</span>
                          <span
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                              checked ? "border-cms-blue bg-cms-blue text-white" : "border-cms-gray-50 bg-white",
                            )}
                            aria-hidden="true"
                          >
                            {checked ? (
                              <svg viewBox="0 0 12 12" className="size-3">
                                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </span>
                        </span>
                        <span className="text-cms-ink/60 mt-0.5 block text-xs leading-5">{disabled ? "University advertisers only" : info.note}</span>
                        <span className="mt-2 flex flex-wrap gap-1.5 text-[0.7rem] font-medium">
                          <span className="text-cms-ink/60 ring-cms-gray-25 rounded-full bg-white px-2 py-0.5 ring-1">
                            {info.limit === null ? "Every live listing shows" : `Up to ${info.limit} at a time`}
                          </span>
                          <span className="text-cms-ink/60 ring-cms-gray-25 rounded-full bg-white px-2 py-0.5 ring-1">Image {formatSpecs[info.format].image}</span>
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Copy" description="In English. No promises of admission, scores, or visas.">
            <Field id="copy-title" label="Title" hint={`${copy.title.length}/60`} error={copyError("title")}>
              <Input
                id="copy-title"
                maxLength={60}
                value={copy.title}
                onChange={(event) => setCopy({ title: event.target.value })}
                aria-describedby={describedBy("copy-title", copyError("title"), true)}
              />
            </Field>
            <Field id="copy-body" label="Body" hint={`${copy.body.length}/140`} error={copyError("body")}>
              <Textarea
                id="copy-body"
                rows={2}
                maxLength={140}
                value={copy.body}
                onChange={(event) => setCopy({ body: event.target.value })}
                aria-describedby={describedBy("copy-body", copyError("body"), true)}
              />
            </Field>
            <Field id="copy-cta" label="Button text" hint={`${copy.cta.length}/24`} error={copyError("cta")}>
              <Input id="copy-cta" maxLength={24} value={copy.cta} onChange={(event) => setCopy({ cta: event.target.value })} aria-describedby={describedBy("copy-cta", copyError("cta"), true)} />
            </Field>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Section title="Schedule" defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field id="startsOn" label="Starts" error={errors.startsOn}>
                <Input id="startsOn" type="date" value={draft.startsOn} onChange={(event) => patch({ startsOn: event.target.value })} />
              </Field>
              <Field id="endsOn" label="Ends" error={errors.endsOn}>
                <Input id="endsOn" type="date" min={draft.startsOn} value={draft.endsOn} onChange={(event) => patch({ endsOn: event.target.value })} />
              </Field>
            </div>
            <p className="text-cms-ink/60 -mt-2 text-xs">Both days included, in Medan time (WIB).</p>
          </Section>

          <Section title="Creative" defaultOpen>
            <MediaPicker
              id="image"
              label="Banner image"
              spec={imageSpec}
              ratio={hero ? 16 / 9 : listing ? 3 / 2 : undefined}
              minWidth={hero ? 1920 : listing ? 1200 : undefined}
              value={draft.image}
              onChange={(image) => patch({ image })}
              error={errors.image}
            />
            {/* Only the university listing shows a logo. */}
            {listing ? (
              <MediaPicker
                id="logo"
                label="Logo (optional)"
                spec="transparent PNG"
                aspectClass="aspect-[8/3]"
                fit="contain"
                value={draft.logo}
                onChange={(logo) => patch({ logo })}
                error={errors.logo}
              />
            ) : null}
          </Section>

          <Section title="Preview" defaultOpen>
            {draft.slots.length === 0 ? <p className="text-cms-ink/60 text-sm">Tick a placement to see how it looks.</p> : null}
            {hero ? (
              <figure className="grid gap-2">
                <figcaption className="text-cms-ink/55 text-xs font-semibold">{sponsorSlots["home-hero"].label}</figcaption>
                <HeroPreview draft={draft} copy={copy} />
              </figure>
            ) : null}
            {listing ? (
              <figure className="grid gap-2">
                <figcaption className="text-cms-ink/55 text-xs font-semibold">{sponsorSlots.universities.label}</figcaption>
                <ListingPreview draft={draft} copy={copy} />
              </figure>
            ) : null}
          </Section>

          {draft.id && canDelete ? (
            <DeleteButton
              label="Delete campaign"
              title={`Delete ${draft.slug}?`}
              description="It disappears from every placement. To stop it for now and keep its history, use Pause."
              onConfirm={() => deleteAdAction(draft.id!)}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

const label = "Sponsored";

function HeroPreview({ draft, copy }: { draft: AdDraft; copy: Copy }) {
  return (
    <div className="bg-cms-navy relative aspect-[16/10] overflow-hidden rounded-xl text-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
      {draft.image ? <img src={draft.image} alt="" className="absolute inset-0 size-full object-cover" /> : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#2a2d34f6_0%,#2a2d34c8_45%,transparent_85%)]" />
      <div className="relative flex h-full max-w-[75%] flex-col justify-center p-4">
        <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold">
          <span className="text-cms-ink rounded-full bg-white/90 px-1.5 py-0.5 uppercase">{label}</span>
          <span className="truncate text-white/80">{draft.advertiser || "Advertiser"}</span>
        </p>
        <p className="mt-2 text-base leading-tight font-bold">{copy.title || "Campaign title"}</p>
        <p className="mt-1.5 line-clamp-2 text-[0.7rem] text-white/80">{copy.body || "Body text"}</p>
        <span className="text-cms-blue mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.7rem] font-semibold">
          {copy.cta || "Button"}
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function ListingPreview({ draft, copy }: { draft: AdDraft; copy: Copy }) {
  return (
    <div className={cn(panel, "ring-cms-gray-25 overflow-hidden ring-1")}>
      <div className="bg-cms-field relative aspect-[3/2]">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
        {draft.image ? <img src={draft.image} alt="" className="size-full object-cover" /> : null}
        {draft.kind === "university" && draft.country ? (
          <span className="bg-cms-blue absolute top-2 left-2 rounded-md px-2 py-0.5 text-[0.65rem] font-semibold text-white">{draft.country}</span>
        ) : null}
        <span className="text-cms-ink absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-semibold uppercase">{label}</span>
      </div>
      <div className="p-3.5">
        <p className="text-cms-ink/60 flex items-center gap-1 truncate text-xs">
          {draft.kind === "university" ? <MapPin className="size-3" aria-hidden="true" /> : null}
          {[draft.advertiser || "Advertiser", draft.kind === "university" ? draft.city : ""].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 leading-snug font-semibold">{copy.title || "Campaign title"}</p>
        <p className="text-cms-ink/60 mt-1 line-clamp-2 text-xs">{copy.body || "Body text"}</p>
        {draft.kind === "university" && draft.majors.length ? (
          <p className="mt-2 flex flex-wrap gap-1">
            {draft.majors.slice(0, 4).map((major) => (
              <span key={major} className="bg-cms-blue-10 text-cms-blue rounded-full px-2 py-0.5 text-[0.65rem] font-semibold">
                {major}
              </span>
            ))}
          </p>
        ) : null}
        <span className="bg-cms-blue mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white">
          {copy.cta || "Button"}
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
