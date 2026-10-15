"use client";

import { ArrowRight, ExternalLink, Eye, EyeOff, LoaderCircle, Save, ShieldCheck, Star } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteStoryAction, saveStoryAction } from "@/actions/cms";
import { slugify } from "@/lib/cms/document";
import { scoreGain } from "@/lib/stories/format";
import { cn } from "@/lib/utils";
import { CountryPicker, type CountryOption } from "./country-picker";
import { describedBy, Field, Input, Select, Textarea } from "./field";
import { Card, DeleteButton, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

export type StoryDraft = {
  id: string | null;
  slug: string;
  studentName: string;
  headline: string;
  body: string;
  program: string;
  scoreLabel: string;
  scoreBefore: string;
  scoreAfter: string;
  destination: string;
  country: string;
  intake: string;
  photo: string;
  photoAlt: string;
  consent: boolean;
  consentNote: string;
  featured: boolean;
  published: boolean;
  updatedAt: string | null;
};

// A sensible score name per program, offered as the placeholder.
const scoreNames: Record<string, string> = { ielts: "IELTS overall band", toefl: "TOEFL iBT total", hsk: "HSK level" };

export function StoryEditor({
  initial,
  images,
  programs,
  countries,
  canDelete,
}: {
  initial: StoryDraft;
  images: string[];
  programs: { slug: string; name: string }[];
  countries: CountryOption[];
  canDelete: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<StoryDraft>) => {
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
      const result = await saveStoryAction({ ...input, published });
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
      toast({ tone: "success", text: published ? "Saved. The story is live on Student stories." : "Saved. The story is hidden from the site." });
      if (wasNew) window.history.replaceState(null, "", `/admin/stories/${result.id}`);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  };

  const gain = scoreGain(draft.scoreBefore.trim(), draft.scoreAfter.trim());
  const paragraphCount = draft.body.split(/\n\s*\n/).filter((part) => part.trim()).length;

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      <SaveBar status={draft.published ? { label: "Live", tone: "success" } : { label: "Hidden", tone: "muted" }} pending={pending} dirty={dirty} saved={Boolean(draft.updatedAt)}>
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
          <Card title="Story" description="In the student's own words. Keep it true and specific: what was hard, what changed, where it led.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="studentName" label="Student name" hint="As the student agreed to be named, e.g. first name only." error={errors.studentName}>
                <Input
                  id="studentName"
                  maxLength={80}
                  value={draft.studentName}
                  onChange={(event) => patch({ studentName: event.target.value, ...(slugTouched ? {} : { slug: slugify(event.target.value) }) })}
                  aria-invalid={Boolean(errors.studentName)}
                  aria-describedby={describedBy("studentName", errors.studentName, true)}
                />
              </Field>
              <Field id="slug" label="Slug" hint={<span className="break-all">/success-stories/{draft.slug || "…"}</span>} error={errors.slug}>
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
            <Field id="headline" label="Quote" hint={`The line on the card. ${draft.headline.length}/180`} error={errors.headline}>
              <Textarea id="headline" rows={2} maxLength={180} value={draft.headline} onChange={(event) => patch({ headline: event.target.value })} aria-invalid={Boolean(errors.headline)} aria-describedby={describedBy("headline", errors.headline, true)} />
            </Field>
            <Field id="body" label="The story" hint={`Leave a blank line between paragraphs. ${paragraphCount} paragraph${paragraphCount === 1 ? "" : "s"} · ${draft.body.length}/4000`} error={errors.body}>
              <Textarea id="body" rows={9} maxLength={4000} value={draft.body} onChange={(event) => patch({ body: event.target.value })} aria-describedby={describedBy("body", errors.body, true)} />
            </Field>
          </Card>

          <Card title="Result" description="Shown as the story's headline numbers. Leave a field empty to leave it out.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="program" label="Program">
                <Select id="program" value={draft.program} onChange={(event) => patch({ program: event.target.value })}>
                  <option value="">Not tied to a program</option>
                  {programs.map((program) => (
                    <option key={program.slug} value={program.slug}>
                      {program.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="scoreLabel" label="Score name" hint="What the numbers measure.">
                <Input id="scoreLabel" maxLength={40} placeholder={scoreNames[draft.program] ?? "e.g. IELTS overall band"} value={draft.scoreLabel} onChange={(event) => patch({ scoreLabel: event.target.value })} aria-describedby="scoreLabel-hint" />
              </Field>
            </div>
            <div className="grid items-end gap-3 rounded-2xl border border-cms-gray-25 p-4 sm:grid-cols-[1fr_auto_1fr_auto]">
              <Field id="scoreBefore" label="Score before" error={errors.scoreBefore}>
                <Input id="scoreBefore" maxLength={12} placeholder="5.5" value={draft.scoreBefore} onChange={(event) => patch({ scoreBefore: event.target.value })} aria-invalid={Boolean(errors.scoreBefore)} />
              </Field>
              <ArrowRight className="mb-4 hidden size-5 text-cms-ink/40 sm:block" aria-hidden="true" />
              <Field id="scoreAfter" label="Score after">
                <Input id="scoreAfter" maxLength={12} placeholder="7.0" value={draft.scoreAfter} onChange={(event) => patch({ scoreAfter: event.target.value })} />
              </Field>
              <span className={cn("mb-1 inline-flex min-h-10 items-center justify-center rounded-full px-3 text-sm font-bold tabular-nums", gain ? "bg-cms-blue-10 text-cms-blue" : "text-cms-ink/35")} aria-live="polite">
                {gain ?? "±0"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="destination" label="Destination" hint="University or school the student is going to." error={errors.destination}>
                <Input id="destination" maxLength={120} value={draft.destination} onChange={(event) => patch({ destination: event.target.value })} aria-describedby={describedBy("destination", errors.destination, true)} />
              </Field>
              <Field id="country" label="Country" error={errors.country}>
                <CountryPicker id="country" value={draft.country} onChange={(country) => patch({ country })} countries={countries} />
              </Field>
              <Field id="intake" label="Intake" hint="E.g. September 2026." error={errors.intake}>
                <Input id="intake" maxLength={40} value={draft.intake} onChange={(event) => patch({ intake: event.target.value })} aria-describedby={describedBy("intake", errors.intake, true)} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          {/* Consent first: nothing else matters if the student has not agreed. */}
          <section className={cn("rounded-[1.75rem] p-5", draft.consent ? "bg-cms-blue-10" : "bg-white ring-2 ring-cms-blue/20")} aria-labelledby="consent-heading">
            <h2 id="consent-heading" className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="size-5 text-cms-blue" aria-hidden="true" />
              Consent
            </h2>
            <label className="mt-3 flex items-start gap-3 text-sm leading-6">
              <input type="checkbox" className="mt-1 size-4 accent-cms-blue" checked={draft.consent} onChange={(event) => patch({ consent: event.target.checked })} aria-describedby={errors.consent ? "consent-error" : undefined} />
              The student (and a parent, if under 18) agreed in writing to publish their name, photo, scores, and destination.
            </label>
            {errors.consent ? (
              <p id="consent-error" className="mt-2 text-sm text-danger">
                {errors.consent}
              </p>
            ) : null}
            <Field id="consentNote" label="Where the signed form is kept" error={errors.consentNote} className="mt-3">
              <Input id="consentNote" maxLength={200} placeholder="e.g. Consent form, signed 12 Oct 2026, student file" value={draft.consentNote} onChange={(event) => patch({ consentNote: event.target.value })} aria-invalid={Boolean(errors.consentNote)} />
            </Field>
            {!draft.consent ? <p className="mt-3 text-xs leading-5 text-cms-ink/60">You can save a draft, but it cannot be published until consent is recorded.</p> : null}
          </section>
          <Section title="Photo" defaultOpen>
            <MediaPicker id="photo" label="Portrait" spec="Portrait, at least 900 wide" ratio={4 / 5} minWidth={900} aspectClass="aspect-[4/5]" value={draft.photo} onChange={(photo) => patch({ photo })} siteImages={images} error={errors.photo} />
            <Field id="photoAlt" label="Photo description" hint="For screen readers, e.g. “Ayu at her graduation”.">
              <Input id="photoAlt" maxLength={160} value={draft.photoAlt} onChange={(event) => patch({ photoAlt: event.target.value })} aria-describedby="photoAlt-hint" />
            </Field>
          </Section>
          <Section title="On the site" defaultOpen>
            <label className="flex items-start gap-3 rounded-xl border border-cms-gray-25 p-3">
              <input type="checkbox" className="mt-0.5 size-4 accent-cms-blue" checked={draft.featured} onChange={(event) => patch({ featured: event.target.checked })} />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Star className="size-3.5 text-cms-blue" aria-hidden="true" />
                  Featured
                </span>
                <span className="block text-xs leading-5 text-cms-ink/60">Shown large at the top of Student stories.</span>
              </span>
            </label>
            {draft.id && draft.published ? (
              <a href={`/success-stories/${draft.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cms-blue hover:underline">
                View on site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </Section>
          {draft.id && canDelete ? (
            <DeleteButton label="Delete story" title={`Delete ${draft.studentName || "this"}'s story?`} description="It disappears from the site. Keep the signed consent on file. To take it down for a while, use Hide instead." onConfirm={() => deleteStoryAction(draft.id!)} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
