"use client";

import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { useToast } from "../toast";
import { EditorContent, useEditor } from "@tiptap/react";
import { CalendarClock, ExternalLink, Globe2, LoaderCircle, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { saveArticle } from "@/actions/cms";
import { readingMinutes, slugify, type DocNode } from "@/lib/cms/document";
import { articleExtensions } from "@/lib/cms/extensions";
import { articleState } from "@/lib/cms/status";
import type { ArticleInput } from "@/lib/cms/validation";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "../date-time-picker";
import { describedBy, Field, Input, Textarea } from "../field";
import { panel, primaryAction, secondaryAction } from "../page-header";
import { Section } from "../section";
import { StatusBadge } from "../status-badge";
import { DeleteArticleButton } from "./delete-article-button";
import { Toolbar } from "./toolbar";

export type ArticleDraft = {
  id: string | null;
  locale: "id" | "en";
  title: string;
  slug: string;
  excerpt: string;
  content: DocNode;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  updatedAt: string | null;
  authorName: string | null;
};


// Module-level so useEditor sees the same options on every render and never resets the editor.
const editorExtensions = [
  ...articleExtensions,
  Placeholder.configure({ placeholder: "Write the article. Use headings to break it into sections…" }),
  CharacterCount,
];

const editorProps = {
  attributes: {
    class: "article-prose min-h-[28rem] px-5 py-6 outline-none sm:px-8",
    "aria-label": "Article body",
  },
};

export function ArticleEditor({ initial, categories, canDelete }: { initial: ArticleDraft; categories: string[]; canDelete: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const contentRef = useRef<DocNode>(initial.content);
  const [words, setWords] = useState(0);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initial.content,
    // The page is server-rendered; the editor mounts on the client only.
    immediatelyRender: false,
    editorProps,
    onCreate: ({ editor }) => setWords(editor.storage.characterCount.words()),
    onUpdate: ({ editor }) => {
      setWords(editor.storage.characterCount.words());
      // ProseMirror attrs are not plain objects, and server actions would send them as opaque
      // references. A JSON round trip gives the action plain data it can validate.
      contentRef.current = JSON.parse(JSON.stringify(editor.getJSON())) as DocNode;
      setDirty(true);
    },
  });


  const update = useCallback(<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: "" } : current));
    setDirty(true);
  }, []);

  function onTitle(value: string) {
    update("title", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(
    (status: "draft" | "published", publishedAt: string | null = draft.publishedAt) => {
      const input: ArticleInput = {
        id: draft.id,
        locale: draft.locale,
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        content: contentRef.current,
        coverImage: draft.coverImage,
        coverAlt: draft.coverAlt,
        category: draft.category,
        tags: draft.tags,
        status,
        publishedAt,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        noindex: draft.noindex,
      };
      startTransition(async () => {
        const result = await saveArticle(input);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          toast({ tone: "error", text: result.message });
          return;
        }
        const wasNew = !draft.id;
        setDraft((current) => ({ ...current, id: result.id, status, publishedAt: result.publishedAt, updatedAt: result.updatedAt }));
        setErrors({});
        setDirty(false);
        setSlugTouched(true);
        toast({ tone: "success", text: noticeFor(status, result.publishedAt) });
        // Keep the editor mounted (and its undo history) while the URL catches up.
        if (wasNew) window.history.replaceState(null, "", `/admin/articles/${result.id}`);
      });
    },
    [draft, toast],
  );

  // Cmd/Ctrl+S saves without changing the publish state.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save(draft.status);
    }
  }

  const now = new Date();
  const state = articleState({ status: draft.status, publishedAt: draft.publishedAt ? new Date(draft.publishedAt) : null }, now);
  const futureDate = draft.publishedAt !== null && new Date(draft.publishedAt) > now;
  const publicPath = `/articles/${draft.slug || "…"}`;

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      {/* Action bar */}
      <div className="sticky top-[var(--cms-top)] z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-cms-field bg-cms-field/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <StatusBadge state={state} />
          <SaveStatus pending={pending} dirty={dirty} updatedAt={draft.updatedAt} />
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.status === "draft" ? (
            <>
              <button type="button" disabled={pending} onClick={() => save("draft")} className={secondaryAction}>
                <Save className="size-4" aria-hidden="true" />
                Save draft
              </button>
              <button type="button" disabled={pending} onClick={() => save("published")} className={primaryAction}>
                {futureDate ? <CalendarClock className="size-4" aria-hidden="true" /> : <Globe2 className="size-4" aria-hidden="true" />}
                {futureDate ? "Schedule" : "Publish"}
              </button>
            </>
          ) : (
            <>
              <button type="button" disabled={pending} onClick={() => save("draft")} className={secondaryAction}>
                Unpublish
              </button>
              <button type="button" disabled={pending} onClick={() => save("published")} className={primaryAction}>
                <Save className="size-4" aria-hidden="true" />
                Update
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Writing column */}
        <div className="min-w-0">
          <label htmlFor="title" className="sr-only">
            Title
          </label>
          <textarea
            id="title"
            value={draft.title}
            onChange={(event) => onTitle(event.target.value.replace(/\n/g, " "))}
            placeholder="Article title"
            rows={1}
            maxLength={160}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className="field-sizing-content w-full resize-none bg-transparent font-display text-[clamp(2rem,1.4rem+1.6vw,2.9rem)] leading-[1.12] font-semibold tracking-tight text-cms-ink outline-none placeholder:text-cms-gray/70"
          />
          {errors.title ? (
            <p id="title-error" className="mt-1 text-sm text-danger">
              {errors.title}
            </p>
          ) : null}

          <div className={cn(panel, "mt-5 overflow-clip")}>
            {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-cms-field" />}
            {editor ? <EditorContent editor={editor} /> : <div className="min-h-[28rem] animate-pulse bg-cms-field" />}
            <div className="flex justify-between border-t border-cms-field px-5 py-2.5 text-xs text-cms-ink/60 sm:px-8">
              <span>
                {words} {words === 1 ? "word" : "words"} · {readingMinutes(words)} min read
              </span>
              <span className="hidden sm:inline">Ctrl/⌘ + S to save</span>
            </div>
          </div>
          {errors.content ? <p className="mt-2 text-sm text-danger">{errors.content}</p> : null}
        </div>

        {/* Settings column */}
        <aside className="grid content-start gap-4">
          <Section title="Publishing" defaultOpen>
            {/* The site is English only. Older Bahasa records stay in the CMS but are never shown. */}
            {draft.locale === "id" ? (
              <div className="rounded-2xl bg-cms-blue-10 p-3.5 text-sm leading-6">
                <p className="font-semibold">Bahasa Indonesia article</p>
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
                onChange={(event) => {
                  setSlugTouched(true);
                  update("slug", slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : ""));
                }}
                onBlur={() => update("slug", slugify(draft.slug))}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={describedBy("slug", errors.slug, true)}
                spellCheck={false}
              />
            </Field>
            <Field
              id="publishedAt"
              label="Publish date"
              error={errors.publishedAt}
              hint={futureDate ? "In the future, so the article is scheduled." : "Leave empty to use the moment you publish."}
            >
              <DateTimePicker
                id="publishedAt"
                value={draft.publishedAt}
                onChange={(publishedAt) => update("publishedAt", publishedAt)}
                placeholder="When you publish"
                label="Choose publish date and time"
                describedBy={describedBy("publishedAt", errors.publishedAt, true)}
                invalid={Boolean(errors.publishedAt)}
              />
            </Field>
            {draft.authorName ? <p className="text-xs text-cms-ink/60">Author: {draft.authorName}</p> : null}
            {draft.id && state === "published" ? (
              <a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cms-blue hover:underline">
                View on site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </Section>

          <Section title="Summary" defaultOpen>
            <Field id="excerpt" label="Excerpt" error={errors.excerpt} hint={`${draft.excerpt.length}/300 · Shown on article cards.`}>
              <Textarea id="excerpt" rows={3} maxLength={300} value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} />
            </Field>
            <Field id="category" label="Category" error={errors.category}>
              <Input id="category" list="category-options" maxLength={60} value={draft.category} onChange={(event) => update("category", event.target.value)} placeholder="IELTS, Study abroad…" />
              <datalist id="category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </Field>
            <TagsField tags={draft.tags} onChange={(tags) => update("tags", tags)} error={errors.tags} />
          </Section>

          <Section title="Cover image">
            <Field id="coverImage" label="Image URL" error={errors.coverImage} hint="An https:// URL or a path such as /images/cover.jpg.">
              <Input id="coverImage" value={draft.coverImage} onChange={(event) => update("coverImage", event.target.value)} placeholder="https://…" spellCheck={false} />
            </Field>
            {draft.coverImage && /^(https?:\/\/|\/)/.test(draft.coverImage) ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary editor URLs are not in next/image's allowlist
              <img src={draft.coverImage} alt="" className="aspect-[16/9] w-full rounded-xl border border-cms-field object-cover" />
            ) : null}
            <Field id="coverAlt" label="Alt text" error={errors.coverAlt} hint="Describe the image for screen readers.">
              <Input id="coverAlt" maxLength={200} value={draft.coverAlt} onChange={(event) => update("coverAlt", event.target.value)} />
            </Field>
          </Section>

          <Section title="Search engines">
            <Field id="seoTitle" label="SEO title" error={errors.seoTitle} hint={`${draft.seoTitle.length}/60 · Defaults to the article title.`}>
              <Input id="seoTitle" maxLength={60} value={draft.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} placeholder={draft.title.slice(0, 60)} />
            </Field>
            <Field id="seoDescription" label="Meta description" error={errors.seoDescription} hint={`${draft.seoDescription.length}/155 · Defaults to the excerpt.`}>
              <Textarea
                id="seoDescription"
                rows={3}
                maxLength={155}
                value={draft.seoDescription}
                onChange={(event) => update("seoDescription", event.target.value)}
                placeholder={draft.excerpt.slice(0, 155)}
              />
            </Field>
            <div className="rounded-xl border border-cms-field bg-cms-field p-3.5" aria-label="Search result preview">
              <p className="truncate text-xs text-cms-ink/55">{publicPath}</p>
              <p className="mt-0.5 line-clamp-1 text-[0.95rem] font-medium text-cms-blue">{draft.seoTitle || draft.title || "Article title"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-cms-ink/60">{draft.seoDescription || draft.excerpt || "The meta description appears here."}</p>
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={draft.noindex} onChange={(event) => update("noindex", event.target.checked)} className="size-4 accent-cms-blue" />
              Hide from search engines (noindex)
            </label>
          </Section>

          {draft.id && canDelete ? <DeleteArticleButton id={draft.id} title={draft.title} /> : null}
        </aside>
      </div>
    </div>
  );
}

function TagsField({ tags, onChange, error }: { tags: string[]; onChange: (tags: string[]) => void; error?: string }) {
  const [value, setValue] = useState("");

  function add(raw: string) {
    const next = raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    onChange([...new Set([...tags, ...next])].slice(0, 12));
    setValue("");
  }

  return (
    <Field id="tags" label="Tags" error={error} hint="Press Enter or comma to add. Up to 12.">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-cms-field bg-white p-2 focus-within:border-cms-blue focus-within:ring-3 focus-within:ring-cms-blue/15">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-cms-blue-10 py-0.5 pr-1 pl-2.5 text-xs font-semibold text-cms-blue">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((item) => item !== tag))} aria-label={`Remove tag ${tag}`} className="rounded-full p-0.5 hover:bg-cms-blue/10">
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id="tags"
          value={value}
          onChange={(event) => (event.target.value.endsWith(",") ? add(event.target.value) : setValue(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(value);
            } else if (event.key === "Backspace" && !value && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => add(value)}
          maxLength={40}
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none focus-visible:outline-none"
        />
      </div>
    </Field>
  );
}

function SaveStatus({ pending, dirty, updatedAt }: { pending: boolean; dirty: boolean; updatedAt: string | null }) {
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-cms-ink/60">
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  }
  if (dirty) return <span className="text-sm text-warning">Unsaved changes</span>;
  if (!updatedAt) return <span className="text-sm text-cms-ink/60">Not saved yet</span>;
  return <span className="truncate text-sm text-cms-ink/60">All changes saved</span>;
}

function noticeFor(status: "draft" | "published", publishedAt: string | null) {
  if (status === "draft") return "Saved as a draft. It is not visible on the site.";
  if (publishedAt && new Date(publishedAt) > new Date()) {
    return `Scheduled for ${new Date(publishedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`;
  }
  return "Published.";
}
