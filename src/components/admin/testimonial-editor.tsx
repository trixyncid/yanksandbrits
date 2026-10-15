"use client";

import { Eye, EyeOff, LoaderCircle, Quote, Save, ShieldCheck } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteTestimonialAction, saveTestimonialAction } from "@/actions/cms";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, DeleteButton, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

export type TestimonialDraft = { id: string | null; quote: string; name: string; role: string; photo: string; published: boolean; updatedAt: string | null };

export function TestimonialEditor({ initial, images, canDelete }: { initial: TestimonialDraft; images: string[]; canDelete: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<TestimonialDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setDirty(true);
  };

  const save = (published: boolean) => {
    startTransition(async () => {
      const result = await saveTestimonialAction({ id: draft.id, quote: draft.quote, name: draft.name, role: draft.role, photo: draft.photo, published });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({ ...current, id: result.id, published, updatedAt: result.updatedAt }));
      setErrors({});
      setDirty(false);
      toast({ tone: "success", text: published ? "Saved. The quote is live on the home page." : "Saved. The quote is hidden from the site." });
      if (wasNew) window.history.replaceState(null, "", `/admin/testimonials/${result.id}`);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  };

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
          <Card title="Testimonial" description="In the person's own words. Keep it short enough to read at a glance.">
            <p className="flex items-start gap-2.5 rounded-2xl bg-cms-blue-10 px-3.5 py-3 text-sm leading-6">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cms-blue" aria-hidden="true" />
              Publish only with the person&apos;s written consent to their name, photo, and words.
            </p>
            <Field id="quote" label="Quote" hint={`${draft.quote.length}/400`} error={errors.quote}>
              <Textarea id="quote" rows={5} maxLength={400} value={draft.quote} onChange={(event) => patch({ quote: event.target.value })} aria-invalid={Boolean(errors.quote)} aria-describedby={describedBy("quote", errors.quote, true)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Name" error={errors.name}>
                <Input id="name" maxLength={80} value={draft.name} onChange={(event) => patch({ name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name", errors.name)} />
              </Field>
              <Field id="role" label="Role" hint="E.g. IELTS student, parent of a TOEFL student." error={errors.role}>
                <Input id="role" maxLength={80} value={draft.role} onChange={(event) => patch({ role: event.target.value })} aria-describedby={describedBy("role", errors.role, true)} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Section title="Photo" defaultOpen>
            <MediaPicker id="photo" label="Photo (optional)" spec="4:3 or square, at least 600 wide" ratio={4 / 3} minWidth={600} aspectClass="aspect-[4/3]" value={draft.photo} onChange={(photo) => patch({ photo })} siteImages={images} error={errors.photo} />
          </Section>
          <Section title="Preview" defaultOpen>
            <figure className="rounded-2xl bg-cms-field p-4">
              <Quote className="size-5 text-cms-ink/25" aria-hidden="true" />
              <blockquote className="mt-2 text-sm leading-6">{draft.quote || "The quote appears here."}</blockquote>
              <figcaption className="mt-3 text-sm">
                <span className="block font-semibold">{draft.name || "Name"}</span>
                {draft.role ? <span className="block text-cms-ink/60">{draft.role}</span> : null}
              </figcaption>
            </figure>
          </Section>
          {draft.id && canDelete ? (
            <DeleteButton
              label="Delete testimonial"
              title={draft.name ? `Delete the testimonial from ${draft.name}?` : "Delete this testimonial?"}
              description="It disappears from the home page. To take it down for a while, use Hide instead."
              onConfirm={() => deleteTestimonialAction(draft.id!)}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
