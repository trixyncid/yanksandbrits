"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "./toast";
import { Eye, EyeOff, ExternalLink, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition, type KeyboardEvent } from "react";
import { deleteProgram, saveProgram } from "@/actions/cms";
import { slugify } from "@/lib/cms/document";
import type { ProgramInput } from "@/lib/cms/validation";
import type { ProgramModule } from "@/lib/programs/types";
import { cn } from "@/lib/utils";
import { describedBy, Field, Input, Select, Textarea } from "./field";
import { primaryAction, secondaryAction } from "./page-header";
import { Card, ListEditor } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { Section } from "./section";

export type ProgramDraft = {
  id: string | null;
  locale: "id" | "en";
  slug: string;
  published: boolean;
  category: "language" | "academic";
  name: string;
  tag: string;
  headline: string;
  summary: string;
  targetAudience: string;
  format: "online" | "offline" | "hybrid";
  formatLabel: string;
  duration: string;
  schedule: string;
  level: string;
  outcomes: string[];
  syllabus: ProgramModule[];
  image: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string | null;
};


export function ProgramEditor({ initial, images, canDelete }: { initial: ProgramDraft; images: string[]; canDelete: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const update = useCallback(<K extends keyof ProgramDraft>(key: K, value: ProgramDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: "" } : current));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(published: boolean) {
    const input: ProgramInput = {
      id: draft.id,
      locale: draft.locale,
      slug: draft.slug,
      published,
      category: draft.category,
      name: draft.name,
      tag: draft.tag,
      headline: draft.headline,
      summary: draft.summary,
      targetAudience: draft.targetAudience,
      format: draft.format,
      formatLabel: draft.formatLabel,
      duration: draft.duration,
      // No longer edited or shown (the "At a glance" strip was removed); stored values pass through unchanged.
      schedule: draft.schedule,
      level: draft.level,
      outcomes: draft.outcomes.map((item) => item.trim()).filter(Boolean),
      syllabus: draft.syllabus.filter((item) => item.title.trim() || item.body.trim()),
      image: draft.image,
      imageAlt: draft.imageAlt,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
    };
    startTransition(async () => {
      const result = await saveProgram(input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({
        ...current,
        id: result.id,
        published,
        updatedAt: result.updatedAt,
        outcomes: input.outcomes,
        syllabus: input.syllabus.map((item) => ({ title: item.title, body: item.body ?? "" })),
      }));
      setErrors({});
      setDirty(false);
      setSlugTouched(true);
      toast({
        tone: "success",
        text: published ? "Saved. The program is live on the site." : "Saved. The program is hidden from the site.",
      });
      if (wasNew) window.history.replaceState(null, "", `/admin/programs/${result.id}`);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  }

  const publicPath = `/programs/${draft.slug || "…"}`;

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      <div className="sticky top-[var(--cms-top)] z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-cms-field bg-cms-field/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              draft.published ? "bg-cms-blue-10 text-cms-blue" : "bg-cms-gray-25 text-cms-ink/65",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {draft.published ? "Live" : "Hidden"}
          </span>
          <span className={cn("truncate text-sm", dirty ? "text-warning" : "text-cms-ink/60")}>
            {pending ? "Saving…" : dirty ? "Unsaved changes" : draft.updatedAt ? "All changes saved" : "Not saved yet"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.published ? (
            <button type="button" disabled={pending} onClick={() => save(false)} className={secondaryAction}>
              <EyeOff className="size-4" aria-hidden="true" />
              Hide
            </button>
          ) : (
            <button type="button" disabled={pending} onClick={() => save(false)} className={secondaryAction}>
              <Save className="size-4" aria-hidden="true" />
              Save hidden
            </button>
          )}
          <button type="button" disabled={pending} onClick={() => save(true)} className={primaryAction}>
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : draft.published ? <Save className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            {draft.published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card title="Basics" description="The name and promise shown at the top of the program page and on program cards.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Program name" error={errors.name}>
                <Input
                  id="name"
                  maxLength={60}
                  value={draft.name}
                  onChange={(event) => {
                    update("name", event.target.value);
                    if (!slugTouched) update("slug", slugify(event.target.value));
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("name", errors.name)}
                  placeholder="IELTS"
                />
              </Field>
              <Field id="tag" label="Tag" hint="A short label on cards, e.g. Language." error={errors.tag}>
                <Input id="tag" maxLength={30} value={draft.tag} onChange={(event) => update("tag", event.target.value)} aria-describedby="tag-hint" />
              </Field>
            </div>
            <Field id="headline" label="Headline" hint="The page's main heading. Lead with the outcome." error={errors.headline}>
              <Input id="headline" maxLength={120} value={draft.headline} onChange={(event) => update("headline", event.target.value)} aria-describedby="headline-hint" />
            </Field>
            <Field id="summary" label="Summary" error={errors.summary} hint={`${draft.summary.length}/300 · Under the headline and on cards.`}>
              <Textarea
                id="summary"
                rows={3}
                maxLength={300}
                value={draft.summary}
                onChange={(event) => update("summary", event.target.value)}
                aria-invalid={Boolean(errors.summary)}
                aria-describedby={describedBy("summary", errors.summary, true)}
              />
            </Field>
            <Field id="targetAudience" label="Who it's for" hint="Shown in the highlighted card on the page." error={errors.targetAudience}>
              <Textarea id="targetAudience" rows={2} maxLength={300} value={draft.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} aria-describedby="targetAudience-hint" />
            </Field>
          </Card>

          <Card title="Details" description="Shown around the site: the program page header, the Programs page, and the menu.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="duration" label="Duration" hint="Shown in the program page header." error={errors.duration}>
                <Input id="duration" maxLength={60} value={draft.duration} onChange={(event) => update("duration", event.target.value)} placeholder="12 weeks" aria-describedby="duration-hint" />
              </Field>
              <Field id="category" label="Category" hint="Groups programs in the menu.">
                <Select id="category" value={draft.category} onChange={(event) => update("category", event.target.value as ProgramDraft["category"])} aria-describedby="category-hint">
                  <option value="language">Language</option>
                  <option value="academic">Academic</option>
                </Select>
              </Field>
              <Field id="format" label="Format">
                <Select id="format" value={draft.format} onChange={(event) => update("format", event.target.value as ProgramDraft["format"])}>
                  <option value="hybrid">Online or in person</option>
                  <option value="online">Online</option>
                  <option value="offline">In person in Medan</option>
                </Select>
              </Field>
              <Field id="formatLabel" label="Format details" hint="Optional. Shown with the featured program on the Programs page." error={errors.formatLabel}>
                <Input id="formatLabel" maxLength={160} value={draft.formatLabel} onChange={(event) => update("formatLabel", event.target.value)} aria-describedby="formatLabel-hint" />
              </Field>
            </div>
          </Card>

          <Card title="What students work on" description="Short, concrete outcomes. Up to 8.">
            <ListEditor
              items={draft.outcomes}
              max={8}
              addLabel="Add outcome"
              onChange={(items) => update("outcomes", items)}
              render={(value, onValue, index) => (
                <Input value={value} maxLength={200} onChange={(event) => onValue(event.target.value)} aria-label={`Outcome ${index + 1}`} placeholder="Practise Writing with tutor feedback" />
              )}
              empty=""
            />
            {errors.outcomes ? <p className="text-sm text-danger">{errors.outcomes}</p> : null}
          </Card>

          <Card title="Learning path" description="Modules in order. A one-line description makes each step on the page clearer.">
            <ListEditor
              items={draft.syllabus}
              max={16}
              addLabel="Add module"
              numbered
              onChange={(items) => update("syllabus", items)}
              render={(value, onValue, index) => (
                <div className="grid gap-2">
                  <Input value={value.title} maxLength={80} onChange={(event) => onValue({ ...value, title: event.target.value })} aria-label={`Module ${index + 1} title`} placeholder="Module title" />
                  <Textarea
                    rows={2}
                    maxLength={240}
                    value={value.body}
                    onChange={(event) => onValue({ ...value, body: event.target.value })}
                    aria-label={`Module ${index + 1} description`}
                    placeholder="What happens in this module (optional)"
                  />
                </div>
              )}
              empty={{ title: "", body: "" }}
            />
            {errors.syllabus ? <p className="text-sm text-danger">{errors.syllabus}</p> : null}
          </Card>

        </div>

        <aside className="grid content-start gap-4">
          <Section title="Page" defaultOpen>
            {/* The site is English only. Older Bahasa records stay in the CMS but are never shown. */}
            {draft.locale === "id" ? (
              <div className="rounded-2xl bg-cms-blue-10 p-3.5 text-sm leading-6">
                <p className="font-semibold">Bahasa Indonesia program</p>
                <p className="text-cms-ink/70">The site only shows English. Translate the text, then switch it to English to publish it.</p>
                <button type="button" onClick={() => update("locale", "en")} className="mt-2 font-semibold text-cms-blue hover:underline">
                  Switch to English
                </button>
              </div>
            ) : null}
            <Field id="slug" label="Slug" error={errors.slug} hint={<span className="break-all">{publicPath}</span>}>
              <Input
                id="slug"
                value={draft.slug}
                spellCheck={false}
                onChange={(event) => {
                  setSlugTouched(true);
                  update("slug", slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : ""));
                }}
                onBlur={() => update("slug", slugify(draft.slug))}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={describedBy("slug", errors.slug, true)}
              />
            </Field>
            {draft.id && initial.slug && initial.slug !== draft.slug ? (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs leading-5 text-warning">Changing the slug breaks links to the old address.</p>
            ) : null}
            {draft.id && draft.published && !dirty ? (
              <a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cms-blue hover:underline">
                View on site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </Section>

          <Section title="Image" defaultOpen>
            <MediaPicker
              id="image"
              label="Program image"
              spec="4:3, at least 1200 wide"
              ratio={4 / 3}
              minWidth={1200}
              aspectClass="aspect-[4/3]"
              value={draft.image}
              onChange={(value) => update("image", value)}
              siteImages={images}
              error={errors.image}
            />
            <Field id="imageAlt" label="Alt text" hint="Leave empty if the image is decorative." error={errors.imageAlt}>
              <Input id="imageAlt" maxLength={160} value={draft.imageAlt} onChange={(event) => update("imageAlt", event.target.value)} aria-describedby="imageAlt-hint" />
            </Field>
          </Section>

          <Section title="Search engines">
            <Field id="seoTitle" label="SEO title" error={errors.seoTitle} hint={`${draft.seoTitle.length}/34 · The site name is added after it.`}>
              <Input id="seoTitle" maxLength={34} value={draft.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} placeholder={draft.name} />
            </Field>
            <Field id="seoDescription" label="Meta description" error={errors.seoDescription} hint={`${draft.seoDescription.length}/155 · Defaults to the summary.`}>
              <Textarea id="seoDescription" rows={3} maxLength={155} value={draft.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} placeholder={draft.summary.slice(0, 155)} />
            </Field>
          </Section>

          {draft.id && canDelete ? <DeleteProgramButton id={draft.id} name={draft.name} /> : null}
        </aside>
      </div>
    </div>
  );
}

function DeleteProgramButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={`${secondaryAction} text-danger hover:border-danger/40 hover:text-danger`}>
          <Trash2 className="size-4" aria-hidden="true" />
          Delete program
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold">Delete {name || "this program"}?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">
            The page and its links disappear from the site. To take it offline for a while, use Hide instead.
          </Dialog.Description>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button type="button" className={secondaryAction}>
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteProgram(id);
                  if (result && !result.ok) setError(result.message);
                })
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-danger px-4.5 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-60"
            >
              {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
