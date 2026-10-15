"use client";

import { CalendarClock, ExternalLink, Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteExpoAction, saveExpoAction } from "@/actions/cms";
import { slugify } from "@/lib/cms/document";
import { DateTimePicker } from "./date-time-picker";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, ChipsInput, DeleteButton, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

export type ExpoDraft = {
  id: string | null;
  slug: string;
  name: string;
  summary: string;
  audience: string;
  covers: string[];
  image: string;
  imageAlt: string;
  startsAt: string | null;
  endsAt: string | null;
  venue: string;
  city: string;
  registerUrl: string;
  published: boolean;
  updatedAt: string | null;
};

// Pinned to Medan time so the server and the browser render the same text.
const when = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export function ExpoEditor({ initial, images, canDelete }: { initial: ExpoDraft; images: string[]; canDelete: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<ExpoDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setErrors((current) => {
      const copy = { ...current };
      for (const key of Object.keys(next)) delete copy[key];
      return copy;
    });
    setDirty(true);
  };

  const save = (published: boolean) => {
    startTransition(async () => {
      const { updatedAt: _updatedAt, ...input } = draft;
      const result = await saveExpoAction({ ...input, published, image: draft.image, imageAlt: draft.imageAlt, registerUrl: draft.registerUrl.trim() });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({ ...current, id: result.id, published, updatedAt: result.updatedAt }));
      setErrors({});
      setDirty(false);
      setSlugTouched(true);
      toast({
        tone: "success",
        text: !published ? "Saved. The expo is hidden from the site." : draft.startsAt ? "Saved. The expo is live on the Expo page." : "Saved. It is listed on the Expo page as awaiting a date.",
      });
      if (wasNew) window.history.replaceState(null, "", `/admin/expos/${result.id}`);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  };

  const ended = Boolean(draft.startsAt) && new Date(draft.endsAt ?? draft.startsAt!) < new Date();
  const status = !draft.published ? { label: "Hidden", tone: "muted" as const } : ended ? { label: "Ended", tone: "warning" as const } : draft.startsAt ? { label: "Live", tone: "success" as const } : { label: "Live, no date", tone: "brand" as const };

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      <SaveBar status={status} pending={pending} dirty={dirty} saved={Boolean(draft.updatedAt)}>
        <button type="button" disabled={pending} onClick={() => save(false)} className={secondaryAction}>
          {draft.published ? <EyeOff className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          {draft.published ? "Hide" : "Save hidden"}
        </button>
        <button type="button" disabled={pending} onClick={() => save(true)} className={primaryAction}>
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : draft.published ? <Save className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          {draft.published ? "Update" : "Publish"}
        </button>
      </SaveBar>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card title="Expo" description="What the session is and who it is for. Never promise admission, scores, scholarships, or visas.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Name" error={errors.name}>
                <Input
                  id="name"
                  maxLength={80}
                  value={draft.name}
                  onChange={(event) => patch({ name: event.target.value, ...(slugTouched ? {} : { slug: slugify(event.target.value) }) })}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("name", errors.name)}
                />
              </Field>
              <Field id="slug" label="Slug" hint={<span className="break-all">/expo#{draft.slug || "…"}</span>} error={errors.slug}>
                <Input
                  id="slug"
                  value={draft.slug}
                  spellCheck={false}
                  onChange={(event) => {
                    setSlugTouched(true);
                    patch({ slug: slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : "") });
                  }}
                  aria-invalid={Boolean(errors.slug)}
                  aria-describedby={describedBy("slug", errors.slug, true)}
                />
              </Field>
            </div>
            <Field id="summary" label="Summary" hint={`${draft.summary.length}/400`} error={errors.summary}>
              <Textarea id="summary" rows={3} maxLength={400} value={draft.summary} onChange={(event) => patch({ summary: event.target.value })} aria-invalid={Boolean(errors.summary)} aria-describedby={describedBy("summary", errors.summary, true)} />
            </Field>
            <Field id="audience" label="Who it's for" hint="E.g. Parents and students choosing a country." error={errors.audience}>
              <Input id="audience" maxLength={120} value={draft.audience} onChange={(event) => patch({ audience: event.target.value })} aria-describedby={describedBy("audience", errors.audience, true)} />
            </Field>
            <Field id="covers" label="On the day" hint="Topics shown as tags. Press Enter or comma to add. Up to 6." error={errors.covers}>
              <ChipsInput id="covers" values={draft.covers} max={6} onChange={(covers) => patch({ covers })} placeholder="Campus pathways, Entry requirements" describedBy="covers-hint" />
            </Field>
          </Card>

          <Card title="When and where" description="Leave the date empty while it is unconfirmed: the site shows “Awaiting confirmation”. Times are in your time zone.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="startsAt" label="Starts" error={errors.startsAt} hint="Empty means the date is not confirmed yet.">
                <DateTimePicker id="startsAt" value={draft.startsAt} onChange={(startsAt) => patch({ startsAt })} placeholder="Not confirmed yet" label="Choose the start date and time" invalid={Boolean(errors.startsAt)} describedBy={describedBy("startsAt", errors.startsAt, true)} />
              </Field>
              <Field id="endsAt" label="Ends (optional)" error={errors.endsAt} hint="For a multi-day expo, or to show an end time.">
                <DateTimePicker id="endsAt" value={draft.endsAt} onChange={(endsAt) => patch({ endsAt })} placeholder="Same day" label="Choose the end date and time" invalid={Boolean(errors.endsAt)} describedBy={describedBy("endsAt", errors.endsAt, true)} />
              </Field>
              <Field id="venue" label="Venue" hint="E.g. Hotel ballroom, street address." error={errors.venue}>
                <Input id="venue" maxLength={120} value={draft.venue} onChange={(event) => patch({ venue: event.target.value })} aria-describedby={describedBy("venue", errors.venue, true)} />
              </Field>
              <Field id="city" label="City" error={errors.city}>
                <Input id="city" maxLength={60} value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
              </Field>
            </div>
            <Field id="registerUrl" label="Registration link (optional)" hint="A full https:// sign-up page. Without one, “Register interest” opens the consultation form." error={errors.registerUrl}>
              <Input id="registerUrl" type="url" inputMode="url" spellCheck={false} placeholder="https://" value={draft.registerUrl} onChange={(event) => patch({ registerUrl: event.target.value })} aria-invalid={Boolean(errors.registerUrl)} aria-describedby={describedBy("registerUrl", errors.registerUrl, true)} />
            </Field>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Section title="Photo" defaultOpen>
            <MediaPicker id="image" label="Photo" spec="Landscape or square, at least 800 wide" ratio={4 / 3} minWidth={800} aspectClass="aspect-[4/3]" value={draft.image} onChange={(image) => patch({ image })} siteImages={images} error={errors.image} />
            <Field id="imageAlt" label="Photo description" hint="For screen readers. Leave empty if it is decoration." error={errors.imageAlt}>
              <Input id="imageAlt" maxLength={160} value={draft.imageAlt} onChange={(event) => patch({ imageAlt: event.target.value })} aria-describedby={describedBy("imageAlt", errors.imageAlt, true)} />
            </Field>
          </Section>
          <Section title="On the site" defaultOpen>
            <p className="flex items-start gap-2.5 text-sm leading-6 text-cms-ink/75">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-cms-blue" aria-hidden="true" />
              {draft.startsAt ? `${when.format(new Date(draft.startsAt))} WIB. Dated expos are listed first, soonest first, and drop off after they end.` : "No date yet, so it is listed after dated expos with “Awaiting confirmation”."}
            </p>
            {draft.id && draft.published && !ended ? (
              <a href={`/expo#${draft.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cms-blue hover:underline">
                View on site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </Section>
          {draft.id && canDelete ? (
            <DeleteButton label="Delete expo" title={`Delete ${draft.name || "this expo"}?`} description="It disappears from the Expo page and the home page. To take it down for a while, use Hide instead." onConfirm={() => deleteExpoAction(draft.id!)} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
