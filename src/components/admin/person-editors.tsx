"use client";

import { Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { deletePersonAction, saveCounsellor, saveTutor } from "@/actions/cms";
import { slugify } from "@/lib/cms/document";
import type { CounsellorText, TutorText } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, ChipsInput, DeleteButton, ListEditor, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

// Blank rows from the list editors are left out instead of failing validation.
function cleanLists<T extends Record<string, unknown>>(text: T): T {
  return Object.fromEntries(
    Object.entries(text).map(([field, value]) => [field, Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : value]),
  ) as T;
}

// The site is English only, so profiles carry English text alone.
function cleanContent<T extends Record<string, unknown>>(content: { en: T }) {
  return { en: cleanLists(content.en) };
}
type Result = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** State, saving, and shortcuts shared by the counsellor and tutor editors. */
function usePersonEditor<D extends { id: string | null; name: string; slug: string; published: boolean; updatedAt: string | null }>(
  initial: D,
  base: "counsellors" | "tutors",
  submit: (draft: D, published: boolean) => Promise<Result>,
) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<D>) => {
    setDraft((current) => ({ ...current, ...next }));
    setDirty(true);
  };

  const setName = (name: string) => patch({ name, ...(slugTouched ? {} : { slug: slugify(name) }) } as Partial<D>);
  const setSlug = (value: string) => {
    setSlugTouched(true);
    patch({ slug: slugify(value) + (value.endsWith("-") ? "-" : "") } as Partial<D>);
  };

  const save = (published: boolean) => {
    startTransition(async () => {
      const result = await submit(draft, published);
      if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({ ...current, id: result.id, published, updatedAt: result.updatedAt }));
      setErrors({});
      setDirty(false);
      setSlugTouched(true);
      toast({ tone: "success", text: published ? "Saved. The profile is live on the site." : "Saved. The profile is hidden from the site." });
      if (wasNew) window.history.replaceState(null, "", `/admin/${base}/${result.id}`);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  };

  return { draft, patch, setName, setSlug, errors, pending, dirty, save, onKeyDown };
}

function Shell({
  editor,
  kind,
  canDelete,
  publicPath,
  extraStatus,
  main,
  aside,
}: {
  editor: ReturnType<typeof usePersonEditor<{ id: string | null; name: string; slug: string; published: boolean; updatedAt: string | null }>>;
  kind: "counsellor" | "tutor";
  canDelete: boolean;
  publicPath: string;
  extraStatus?: ReactNode;
  main: ReactNode;
  aside: ReactNode;
}) {
  const { draft, pending, dirty, save, onKeyDown, errors } = editor;
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
        <div className="grid min-w-0 content-start gap-6">{main}</div>
        <aside className="grid content-start gap-4">
          <Section title="Profile" defaultOpen>
            <Field id="name" label="Full name" error={errors.name}>
              <Input id="name" maxLength={80} value={draft.name} onChange={(event) => editor.setName(event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name", errors.name)} />
            </Field>
            <Field id="slug" label="Slug" error={errors.slug} hint={kind === "tutor" ? <span className="break-all">{publicPath}</span> : "Used as the profile id."}>
              <Input id="slug" value={draft.slug} spellCheck={false} onChange={(event) => editor.setSlug(event.target.value)} aria-invalid={Boolean(errors.slug)} aria-describedby={describedBy("slug", errors.slug, true)} />
            </Field>
            {extraStatus}
          </Section>
          {aside}
          {draft.id && canDelete ? (
            <DeleteButton
              label={`Delete ${kind}`}
              title={`Delete ${draft.name || `this ${kind}`}?`}
              description="The profile disappears from the site. To take it down for a while, use Hide instead."
              onConfirm={() => deletePersonAction(kind, draft.id!)}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Toggle({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 rounded-xl border border-cms-field p-3">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 size-4 accent-cms-blue" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs leading-5 text-cms-ink/60">{hint}</span>
      </span>
    </label>
  );
}

/* ---------- Counsellors ---------- */

export type CounsellorDraft = {
  id: string | null;
  slug: string;
  name: string;
  photo: string;
  published: boolean;
  onDesk: boolean;
  whatsapp: string;
  content: { en: CounsellorText };
  updatedAt: string | null;
};

export function CounsellorEditor({ initial, images, canDelete }: { initial: CounsellorDraft; images: string[]; canDelete: boolean }) {
  const editor = usePersonEditor(initial, "counsellors", (draft, published) => saveCounsellor({ ...draft, published, content: cleanContent(draft.content) }));
  const { draft, patch, errors } = editor;
  const text = draft.content.en;
  const setText = (next: Partial<CounsellorText>) => patch({ content: { en: { ...text, ...next } } });
  const key = (field: string) => `content.en.${field}`;

  return (
    <Shell
      editor={editor as never}
      kind="counsellor"
      canDelete={canDelete}
      publicPath="/counselling#team"
      extraStatus={<Toggle id="onDesk" label="On desk" hint="Shows “On desk” instead of “Away” on the card." checked={draft.onDesk} onChange={(onDesk) => patch({ onDesk })} />}
      aside={
        <>
          <Section title="Photo" defaultOpen>
            <MediaPicker id="photo" label="Portrait" spec="3:4, at least 900 wide" ratio={3 / 4} minWidth={900} aspectClass="aspect-[3/4]" value={draft.photo} onChange={(photo) => patch({ photo })} siteImages={images} error={errors.photo} />
          </Section>
          <Section title="Lead alerts" defaultOpen>
            <Field id="whatsapp" label="WhatsApp number" hint="Private, never shown on the site. New leads assigned in Leads are sent here." error={errors.whatsapp}>
              <Input id="whatsapp" inputMode="tel" autoComplete="off" value={draft.whatsapp} onChange={(event) => patch({ whatsapp: event.target.value })} placeholder="0812 3456 7890" aria-describedby="whatsapp-hint" />
            </Field>
          </Section>
        </>
      }
      main={
        <Card title="Profile text" description="Shown on the site in English.">
          <Field id="role" label="Role" error={errors[key("role")]}>
            <Input id="role" maxLength={80} value={text.role} onChange={(event) => setText({ role: event.target.value })} placeholder={"Education counsellor"} />
          </Field>
          <Field id="bio" label="Short bio" hint={`${text.bio.length}/400`} error={errors[key("bio")]}>
            <Textarea id="bio" rows={3} maxLength={400} value={text.bio} onChange={(event) => setText({ bio: event.target.value })} aria-describedby="bio-hint" />
          </Field>
          <Field id="specialisations" label="Focus areas" hint="Press Enter or comma to add. Up to 8." error={errors[key("specialisations")]}>
            <ChipsInput id="specialisations" values={text.specialisations} max={8} onChange={(specialisations) => setText({ specialisations })} placeholder="IELTS pathway, UK applications" describedBy="specialisations-hint" />
          </Field>
          <Field id="countries" label="Countries" hint="Destinations this counsellor covers. Up to 10." error={errors[key("countries")]}>
            <ChipsInput id="countries" values={text.countries} max={10} onChange={(countries) => setText({ countries })} placeholder={"United Kingdom, Ireland"} describedBy="countries-hint" />
          </Field>
        </Card>
      }
    />
  );
}

/* ---------- Tutors ---------- */

export type TutorDraft = {
  id: string | null;
  slug: string;
  name: string;
  photo: string;
  published: boolean;
  featured: boolean;
  programs: string[];
  languages: string[];
  content: { en: TutorText };
  updatedAt: string | null;
};

export function TutorEditor({
  initial,
  images,
  programs,
  canDelete,
}: {
  initial: TutorDraft;
  images: string[];
  programs: { slug: string; name: string }[];
  canDelete: boolean;
}) {
  const editor = usePersonEditor(initial, "tutors", (draft, published) => saveTutor({ ...draft, published, content: cleanContent(draft.content) }));
  const { draft, patch, errors } = editor;
  const text = draft.content.en;
  const setText = (next: Partial<TutorText>) => patch({ content: { en: { ...text, ...next } } });
  const key = (field: string) => `content.en.${field}`;

  return (
    <Shell
      editor={editor as never}
      kind="tutor"
      canDelete={canDelete}
      publicPath={`/tutors/${draft.slug || "…"}`}
      extraStatus={<Toggle id="featured" label="Featured" hint="Listed first, with a Featured badge." checked={draft.featured} onChange={(featured) => patch({ featured })} />}
      aside={
        <>
          <Section title="Photo" defaultOpen>
            <MediaPicker id="photo" label="Portrait" spec="4:5, at least 1000 wide" ratio={4 / 5} minWidth={1000} aspectClass="aspect-[4/5]" value={draft.photo} onChange={(photo) => patch({ photo })} siteImages={images} error={errors.photo} />
          </Section>
          <Section title="Teaching" defaultOpen>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-semibold">Programs</legend>
              {programs.map((program) => (
                <label key={program.slug} className="flex items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-cms-blue"
                    checked={draft.programs.includes(program.slug)}
                    onChange={(event) => patch({ programs: event.target.checked ? [...draft.programs, program.slug] : draft.programs.filter((slug) => slug !== program.slug) })}
                  />
                  {program.name}
                </label>
              ))}
            </fieldset>
            <Field id="languages" label="Teaches in" hint="E.g. English, Bahasa Indonesia, Mandarin." error={errors.languages}>
              <ChipsInput id="languages" values={draft.languages} max={8} onChange={(languages) => patch({ languages })} describedBy="languages-hint" />
            </Field>
          </Section>
        </>
      }
      main={
        <>
          <Card title="Profile text" description="Shown on the site in English.">
            <Field id="role" label="Role" error={errors[key("role")]}>
              <Input id="role" maxLength={80} value={text.role} onChange={(event) => setText({ role: event.target.value })} placeholder={"IELTS tutor"} />
            </Field>
            <Field id="bio" label="Bio" hint={`${text.bio.length}/800`} error={errors[key("bio")]}>
              <Textarea id="bio" rows={5} maxLength={800} value={text.bio} onChange={(event) => setText({ bio: event.target.value })} aria-describedby="bio-hint" />
            </Field>
            <Field id="subjects" label="Subjects" hint="Press Enter or comma to add. Up to 10." error={errors[key("subjects")]}>
              <ChipsInput id="subjects" values={text.subjects} max={10} onChange={(subjects) => setText({ subjects })} placeholder="IELTS Writing, Academic English" describedBy="subjects-hint" />
            </Field>
          </Card>
          <Card title="Credentials" description="One line each. Shown as two cards on the profile page.">
            <p className="text-sm font-semibold">Education</p>
            <ListEditor items={text.education} max={6} addLabel="Add education" empty="" onChange={(education) => setText({ education })} render={(value, onValue, index) => <Input value={value} maxLength={160} onChange={(event) => onValue(event.target.value)} aria-label={`Education ${index + 1}`} placeholder="MSc Applied Linguistics, University of Leeds" />} />
            <p className={cn("mt-2 text-sm font-semibold")}>Certifications</p>
            <ListEditor items={text.certifications} max={8} addLabel="Add certification" empty="" onChange={(certifications) => setText({ certifications })} render={(value, onValue, index) => <Input value={value} maxLength={120} onChange={(event) => onValue(event.target.value)} aria-label={`Certification ${index + 1}`} placeholder="CELTA" />} />
          </Card>
          <Card title="Experience and results" description="Keep results factual. The page notes that past results are not guaranteed.">
            <Field id="experience" label="Teaching experience" error={errors[key("experience")]}>
              <Textarea id="experience" rows={3} maxLength={300} value={text.experience} onChange={(event) => setText({ experience: event.target.value })} />
            </Field>
            <Field id="results" label="Notable results" error={errors[key("results")]}>
              <Textarea id="results" rows={3} maxLength={300} value={text.results} onChange={(event) => setText({ results: event.target.value })} />
            </Field>
          </Card>
        </>
      }
    />
  );
}
