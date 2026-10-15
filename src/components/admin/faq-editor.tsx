"use client";

import { Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { useToast } from "./toast";
import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteFaqAction, saveFaqAction } from "@/actions/cms";
import { paragraphs } from "@/lib/stories/format";
import { cn } from "@/lib/utils";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, DeleteButton, SaveBar, useUnsavedWarning } from "./form-parts";
import { primaryAction, secondaryAction } from "./page-header";
import { Section } from "./section";

export type FaqDraft = { id: string | null; question: string; answer: string; category: string; programs: string[]; showOnContact: boolean; published: boolean; updatedAt: string | null };

const chip = "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors";

export function FaqEditor({
  initial,
  categories,
  programs,
  canDelete,
}: {
  initial: FaqDraft;
  /** Categories other questions already use, offered as quick picks. */
  categories: string[];
  programs: { slug: string; name: string }[];
  canDelete: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const patch = (next: Partial<FaqDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setDirty(true);
  };

  const save = (published: boolean) => {
    startTransition(async () => {
      const { updatedAt: _updatedAt, ...input } = draft;
      const result = await saveFaqAction({ ...input, published });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        return;
      }
      const wasNew = !draft.id;
      setDraft((current) => ({ ...current, id: result.id, published, updatedAt: result.updatedAt }));
      setErrors({});
      setDirty(false);
      toast({ tone: "success", text: published ? "Saved. The question is live." : "Saved. The question is hidden from the site." });
      if (wasNew) window.history.replaceState(null, "", `/admin/faqs/${result.id}`);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.published);
    }
  };

  const toggleProgram = (slug: string) => patch({ programs: draft.programs.includes(slug) ? draft.programs.filter((item) => item !== slug) : [...draft.programs, slug] });
  const suggestions = [...new Set(["General", ...categories])];

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
          <Card title="Question" description="Answer the way a counsellor would: direct, honest, and without promises of scores, offers, or visas.">
            <Field id="question" label="Question" hint={`${draft.question.length}/200`} error={errors.question}>
              <Input id="question" maxLength={200} value={draft.question} onChange={(event) => patch({ question: event.target.value })} aria-invalid={Boolean(errors.question)} aria-describedby={describedBy("question", errors.question, true)} />
            </Field>
            <Field id="answer" label="Answer" hint={`Leave a blank line between paragraphs. ${draft.answer.length}/2000`} error={errors.answer}>
              <Textarea id="answer" rows={7} maxLength={2000} value={draft.answer} onChange={(event) => patch({ answer: event.target.value })} aria-invalid={Boolean(errors.answer)} aria-describedby={describedBy("answer", errors.answer, true)} />
            </Field>
          </Card>

          <Card title="Where it appears" description="Every live question is on the FAQ page. Choose programs to show it on their pages too.">
            <Field id="category" label="Category" hint="Groups questions on the FAQ page." error={errors.category}>
              <Input id="category" maxLength={40} value={draft.category} onChange={(event) => patch({ category: event.target.value })} aria-describedby={describedBy("category", errors.category, true)} />
            </Field>
            <div className="-mt-2 flex flex-wrap gap-1.5" aria-label="Existing categories">
              {suggestions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => patch({ category })}
                  aria-pressed={draft.category === category}
                  className={cn(chip, draft.category === category ? "bg-cms-blue text-white ring-cms-blue" : "text-cms-ink/70 ring-cms-gray-25 hover:text-cms-blue hover:ring-cms-blue/30")}
                >
                  {category}
                </button>
              ))}
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-semibold">Program pages</legend>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch({ programs: [] })}
                  aria-pressed={draft.programs.length === 0}
                  className={cn(chip, draft.programs.length === 0 ? "bg-cms-blue text-white ring-cms-blue" : "text-cms-ink/70 ring-cms-gray-25 hover:text-cms-blue hover:ring-cms-blue/30")}
                >
                  All programs
                </button>
                {programs.map((program) => {
                  const on = draft.programs.includes(program.slug);
                  return (
                    <button
                      key={program.slug}
                      type="button"
                      onClick={() => toggleProgram(program.slug)}
                      aria-pressed={on}
                      className={cn(chip, on ? "bg-cms-blue text-white ring-cms-blue" : "text-cms-ink/70 ring-cms-gray-25 hover:text-cms-blue hover:ring-cms-blue/30")}
                    >
                      {program.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-cms-ink/55">
                {draft.programs.length === 0 ? "A general question: shown after the program's own questions on every program page." : "Shown first on these program pages only."}
              </p>
            </fieldset>

            <label className="flex items-start gap-3 rounded-xl border border-cms-gray-25 p-3">
              <input type="checkbox" className="mt-0.5 size-4 accent-cms-blue" checked={draft.showOnContact} onChange={(event) => patch({ showOnContact: event.target.checked })} />
              <span>
                <span className="block text-sm font-semibold">Show on the Contact page</span>
                <span className="block text-xs leading-5 text-cms-ink/60">For the questions that stop people sending the form. Four or five works best.</span>
              </span>
            </label>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Section title="Preview" defaultOpen>
            <div className="overflow-hidden rounded-2xl ring-1 ring-cms-gray-25">
              <p className="bg-cms-field px-4 py-3 text-sm font-semibold">{draft.question || "The question appears here."}</p>
              <div className="grid gap-2 px-4 py-3 text-sm leading-6 text-cms-ink/70">
                {(paragraphs(draft.answer).length ? paragraphs(draft.answer) : ["The answer appears here."]).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Section>
          {draft.id && canDelete ? <DeleteButton label="Delete question" title="Delete this question?" description="It disappears from the FAQ, the Contact page, and program pages. To take it down for a while, use Hide instead." onConfirm={() => deleteFaqAction(draft.id!)} /> : null}
        </aside>
      </div>
    </div>
  );
}
