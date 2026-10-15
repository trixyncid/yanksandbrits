"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import { useToast } from "./toast";
import Link from "next/link";
import { useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { saveHomeAction } from "@/actions/cms";
import type { HomeContent } from "@/lib/home/schema";
import { describedBy, Field, Input, Textarea } from "./field";
import { Card, ListEditor, SaveBar, useUnsavedWarning } from "./form-parts";
import { MediaPicker } from "./media-picker";
import { primaryAction, secondaryAction } from "./page-header";

type Errors = Record<string, string>;

const sections = [
  { id: "banner", label: "Banner" },
  { id: "cards", label: "Cards under the banner" },
  { id: "programs", label: "Programs" },
  { id: "why", label: "Why us" },
  { id: "figures", label: "Key figures" },
  { id: "process", label: "Process" },
  { id: "testimonials", label: "Testimonials" },
  { id: "previews", label: "Tutors & Expo" },
  { id: "articles", label: "Articles" },
] as const;

/** One text input with a live character count. */
function Text({ id, label, value, max, onChange, errors, hint, multiline, placeholder }: { id: string; label: string; value: string; max: number; onChange: (value: string) => void; errors: Errors; hint?: string; multiline?: boolean; placeholder?: string }) {
  const error = errors[id];
  const count = `${value.length}/${max}`;
  return (
    <Field id={id} label={label} hint={hint ? `${hint} ${count}` : count} error={error}>
      {multiline ? (
        <Textarea id={id} rows={3} maxLength={max} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, error, true)} />
      ) : (
        <Input id={id} maxLength={max} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, error, true)} />
      )}
    </Field>
  );
}

function Anchor({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28">
      {children}
    </div>
  );
}

// Lists are edited as text with one item per line; blank lines are dropped on save.
const toLines = (items: string[]) => items.join("\n");
const fromLines = (value: string) => value.split("\n");
const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

function tidy(content: HomeContent): HomeContent {
  return {
    ...content,
    why: { ...content.why, highlights: clean(content.why.highlights) },
    figures: { ...content.figures, items: content.figures.items.filter((item) => item.value.trim() || item.label.trim()) },
    journey: {
      ...content.journey,
      columns: content.journey.columns.map((column) => ({ ...column, groups: column.groups.map((group) => ({ ...group, items: clean(group.items) })) })),
    },
  };
}

export function HomeEditor({ initial, updatedAt: savedAt, images }: { initial: HomeContent; updatedAt: string | null; images: string[] }) {
  const [content, setContent] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState(savedAt);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  useUnsavedWarning(dirty);

  const set = <K extends keyof HomeContent>(section: K, next: Partial<HomeContent[K]>) => {
    setContent((current) => ({ ...current, [section]: { ...current[section], ...next } }));
    setDirty(true);
  };

  const save = () => {
    const next = tidy(content);
    startTransition(async () => {
      const result = await saveHomeAction(next);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast({ tone: "error", text: result.message });
        // Bring the first problem into view.
        const first = Object.keys(result.fieldErrors ?? {})[0];
        if (first) document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      setContent(next);
      setErrors({});
      setDirty(false);
      setUpdatedAt(result.updatedAt);
      toast({ tone: "success", text: "Saved. The home page shows these changes now." });
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!pending) save();
    }
  };

  const { hero, features, programs, why, figures, journey, testimonials, previews, articles } = content;

  return (
    <div onKeyDown={onKeyDown} className="max-w-[90rem]">
      <SaveBar status={{ label: "Homepage", tone: "brand" }} pending={pending} dirty={dirty} saved={Boolean(updatedAt)}>
        <a href="/" target="_blank" rel="noreferrer" className={secondaryAction}>
          <ExternalLink className="size-4" aria-hidden="true" />
          View home page
        </a>
        <button type="button" disabled={pending} onClick={save} className={primaryAction}>
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          Publish changes
        </button>
      </SaveBar>

      <div className="grid gap-6 xl:grid-cols-[13rem_minmax(0,1fr)]">
        {/* Section index: the page is long, so editors can jump straight to a part of it. */}
        <nav aria-label="Homepage sections" className="hidden xl:block">
          <ol className="sticky top-[calc(var(--cms-top)+5.5rem)] grid gap-0.5">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-cms-ink/70 transition-colors hover:bg-white hover:text-cms-ink">
                  <span className="font-mono text-xs text-cms-gray">{String(index + 1).padStart(2, "0")}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid min-w-0 content-start gap-6">
          <Anchor id="banner">
            <Card title="Banner" description="The first thing visitors see. Sponsored slides from Ads rotate after this one.">
              <Text id="hero.title" label="Headline" value={hero.title} max={120} errors={errors} onChange={(title) => set("hero", { title })} />
              <Text id="hero.highlight" label="Underlined words" hint="Optional. Words from the headline that get the hand-drawn underline." value={hero.highlight} max={60} errors={errors} onChange={(highlight) => set("hero", { highlight })} />
              <Text id="hero.body" label="Text" multiline value={hero.body} max={320} errors={errors} onChange={(body) => set("hero", { body })} />
              <Text id="hero.cta" label="Button text" hint="Opens the consultation form." value={hero.cta} max={40} errors={errors} onChange={(cta) => set("hero", { cta })} />
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <MediaPicker id="hero.image" label="Photo" spec="16:9, at least 1920 wide. Keep the left side calm: the text sits there." ratio={16 / 9} minWidth={1920} value={hero.image} onChange={(image) => set("hero", { image })} siteImages={images} error={errors["hero.image"]} />
                <Text id="hero.imageAlt" label="Photo description" hint="For screen readers. Leave empty if the photo is decoration." multiline value={hero.imageAlt} max={160} errors={errors} onChange={(imageAlt) => set("hero", { imageAlt })} />
              </div>
            </Card>
          </Anchor>

          <Anchor id="cards">
            <Card title="Cards under the banner" description="Short cards that overlap the bottom of the banner, each linking to its page.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-4 rounded-2xl border border-cms-gray-25 p-4">
                  <Text id="features.programs.title" label="Programs card title" value={features.programs.title} max={60} errors={errors} onChange={(title) => set("features", { programs: { ...features.programs, title } })} />
                  <Text id="features.programs.body" label="Programs card text" multiline value={features.programs.body} max={220} errors={errors} onChange={(body) => set("features", { programs: { ...features.programs, body } })} />
                </div>
                <div className="grid gap-4 rounded-2xl border border-cms-gray-25 p-4">
                  <Text id="features.counsellors.title" label="Counsellors card title" value={features.counsellors.title} max={60} errors={errors} onChange={(title) => set("features", { counsellors: { ...features.counsellors, title } })} />
                  <Text id="features.counsellors.body" label="Counsellors card text" multiline value={features.counsellors.body} max={220} errors={errors} onChange={(body) => set("features", { counsellors: { ...features.counsellors, body } })} />
                </div>
              </div>
              <details className="rounded-2xl border border-cms-gray-25 p-4">
                <summary className="cursor-pointer text-sm font-semibold">Study abroad card (hidden on the site for now)</summary>
                <div className="mt-4 grid gap-4">
                  <Text id="features.studyAbroad.title" label="Title" value={features.studyAbroad.title} max={60} errors={errors} onChange={(title) => set("features", { studyAbroad: { ...features.studyAbroad, title } })} />
                  <Text id="features.studyAbroad.body" label="Text" multiline value={features.studyAbroad.body} max={220} errors={errors} onChange={(body) => set("features", { studyAbroad: { ...features.studyAbroad, body } })} />
                </div>
              </details>
              <Text id="features.more" label="Link text on each card" value={features.more} max={30} errors={errors} onChange={(more) => set("features", { more })} />
            </Card>
          </Anchor>

          <Anchor id="programs">
            <Card title="Programs" description="The heading above the program cards. The cards themselves come from Programs.">
              <Text id="programs.eyebrow" label="Label" value={programs.eyebrow} max={40} errors={errors} onChange={(eyebrow) => set("programs", { eyebrow })} />
              <Text id="programs.title" label="Title" value={programs.title} max={120} errors={errors} onChange={(title) => set("programs", { title })} />
              <Text id="programs.body" label="Text" multiline value={programs.body} max={320} errors={errors} onChange={(body) => set("programs", { body })} />
              <Text id="programs.see" label="Card button label" hint="Read by screen readers on each card's arrow button." value={programs.see} max={40} errors={errors} onChange={(see) => set("programs", { see })} />
              <Link href="/admin/programs" className="text-sm font-semibold text-cms-blue hover:underline">
                Edit the programs →
              </Link>
            </Card>
          </Anchor>

          <Anchor id="why">
            <Card title="Why us" description="Two photos beside the reasons students choose the school.">
              <Text id="why.eyebrow" label="Label" value={why.eyebrow} max={40} errors={errors} onChange={(eyebrow) => set("why", { eyebrow })} />
              <Text id="why.title" label="Title" value={why.title} max={120} errors={errors} onChange={(title) => set("why", { title })} />
              <Text id="why.body" label="Text" multiline value={why.body} max={400} errors={errors} onChange={(body) => set("why", { body })} />
              <Field id="why.highlights" label="Highlights" hint="Short points beside an icon. Up to 4." error={errors["why.highlights"]}>
                <ListEditor
                  items={why.highlights}
                  max={4}
                  addLabel="Add a highlight"
                  empty=""
                  onChange={(highlights) => set("why", { highlights })}
                  render={(value, onValue, index) => <Input aria-label={`Highlight ${index + 1}`} maxLength={40} value={value} onChange={(event) => onValue(event.target.value)} />}
                />
              </Field>
              <Text id="why.cta" label="Button text" hint="Opens the consultation form." value={why.cta} max={40} errors={errors} onChange={(cta) => set("why", { cta })} />
              <div className="grid gap-4 md:grid-cols-2">
                <MediaPicker id="why.imageMain" label="Main photo" spec="Portrait, at least 900 wide" ratio={4 / 5} minWidth={900} aspectClass="aspect-[4/5]" value={why.imageMain} onChange={(imageMain) => set("why", { imageMain })} siteImages={images} error={errors["why.imageMain"]} />
                <MediaPicker id="why.imageInset" label="Small photo" spec="Landscape, at least 600 wide" ratio={3 / 2} minWidth={600} aspectClass="aspect-[3/2]" value={why.imageInset} onChange={(imageInset) => set("why", { imageInset })} siteImages={images} error={errors["why.imageInset"]} />
              </div>
              <div className="grid gap-4 rounded-2xl border border-cms-gray-25 p-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <Text id="why.badgeValue" label="Badge number" hint="Optional." placeholder="11+" value={why.badgeValue} max={12} errors={errors} onChange={(badgeValue) => set("why", { badgeValue })} />
                <Text id="why.badgeLabel" label="Badge label" hint="Shown on the photo with the number. Only use checked facts." placeholder="Years in Medan" value={why.badgeLabel} max={40} errors={errors} onChange={(badgeLabel) => set("why", { badgeLabel })} />
              </div>
            </Card>
          </Anchor>

          <Anchor id="figures">
            <Card title="Key figures" description="The blue band of numbers. Hidden until you add one. Only publish figures you can back up.">
              <ListEditor
                items={figures.items}
                max={4}
                addLabel="Add a figure"
                empty={{ value: "", label: "" }}
                onChange={(items) => set("figures", { items })}
                render={(value, onValue, index) => (
                  <div className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <Input aria-label={`Figure ${index + 1} number`} placeholder="1,200" maxLength={12} value={value.value} onChange={(event) => onValue({ ...value, value: event.target.value })} aria-invalid={Boolean(errors[`figures.items.${index}.value`])} />
                    <Input aria-label={`Figure ${index + 1} label`} placeholder="Students taught" maxLength={60} value={value.label} onChange={(event) => onValue({ ...value, label: event.target.value })} aria-invalid={Boolean(errors[`figures.items.${index}.label`])} />
                  </div>
                )}
              />
              <Text id="figures.note" label="Note under the figures" hint="Optional. E.g. where the numbers come from and when they were checked." multiline value={figures.note} max={240} errors={errors} onChange={(note) => set("figures", { note })} />
            </Card>
          </Anchor>

          <Anchor id="process">
            <Card title="Process" description="The steps from first consultation to departure, in two columns.">
              <Text id="journey.eyebrow" label="Label" value={journey.eyebrow} max={40} errors={errors} onChange={(eyebrow) => set("journey", { eyebrow })} />
              <Text id="journey.title" label="Title" value={journey.title} max={120} errors={errors} onChange={(title) => set("journey", { title })} />
              <Text id="journey.body" label="Text" multiline value={journey.body} max={400} errors={errors} onChange={(body) => set("journey", { body })} />
              <Text id="journey.cta" label="Button text" hint="Opens the consultation form." value={journey.cta} max={40} errors={errors} onChange={(cta) => set("journey", { cta })} />
              <div className="grid gap-4 lg:grid-cols-2">
                {journey.columns.map((column, columnIndex) => {
                  const setColumn = (next: Partial<typeof column>) => set("journey", { columns: journey.columns.map((current, i) => (i === columnIndex ? { ...current, ...next } : current)) });
                  return (
                    <div key={columnIndex} className="grid content-start gap-4 rounded-2xl border border-cms-gray-25 p-4">
                      <Text id={`journey.columns.${columnIndex}.title`} label={`Column ${columnIndex + 1} title`} value={column.title} max={60} errors={errors} onChange={(title) => setColumn({ title })} />
                      <ListEditor
                        items={column.groups}
                        max={4}
                        addLabel="Add a group"
                        empty={{ heading: "", items: [] }}
                        onChange={(groups) => setColumn({ groups })}
                        render={(group, onGroup, groupIndex) => (
                          <div className="grid gap-2 rounded-xl border border-cms-gray-25 p-3">
                            <Input aria-label={`Column ${columnIndex + 1}, group ${groupIndex + 1} heading`} placeholder="Heading" maxLength={60} value={group.heading} onChange={(event) => onGroup({ ...group, heading: event.target.value })} aria-invalid={Boolean(errors[`journey.columns.${columnIndex}.groups.${groupIndex}.heading`])} />
                            <Textarea aria-label={`Column ${columnIndex + 1}, group ${groupIndex + 1} steps, one per line`} rows={3} placeholder="One step per line" value={toLines(group.items)} onChange={(event) => onGroup({ ...group, items: fromLines(event.target.value) })} />
                          </div>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </Anchor>

          <Anchor id="testimonials">
            <Card title="Testimonials" description="The heading above the quotes. The quotes come from Testimonials; the section is hidden until one is live.">
              <Text id="testimonials.eyebrow" label="Label" value={testimonials.eyebrow} max={40} errors={errors} onChange={(eyebrow) => set("testimonials", { eyebrow })} />
              <Text id="testimonials.title" label="Title" value={testimonials.title} max={120} errors={errors} onChange={(title) => set("testimonials", { title })} />
              <Link href="/admin/testimonials" className="text-sm font-semibold text-cms-blue hover:underline">
                Edit the testimonials →
              </Link>
            </Card>
          </Anchor>

          <Anchor id="previews">
            <Card title="Tutors & Expo" description="Two cards near the end of the page that link to the Tutors and Expo pages.">
              <div className="grid gap-4 lg:grid-cols-2">
                {(["tutors", "expo"] as const).map((key) => {
                  const block = previews[key];
                  const setBlock = (next: Partial<typeof block>) => set("previews", { [key]: { ...block, ...next } } as Partial<HomeContent["previews"]>);
                  const name = key === "tutors" ? "Tutors" : "Expo";
                  return (
                    <div key={key} className="grid content-start gap-4 rounded-2xl border border-cms-gray-25 p-4">
                      <MediaPicker id={`previews.${key}.image`} label={`${name} photo`} spec="Landscape, at least 1200 wide" ratio={16 / 9} minWidth={1200} value={block.image} onChange={(image) => setBlock({ image })} siteImages={images} error={errors[`previews.${key}.image`]} />
                      <Text id={`previews.${key}.title`} label={`${name} title`} value={block.title} max={80} errors={errors} onChange={(title) => setBlock({ title })} />
                      <Text id={`previews.${key}.body`} label={`${name} text`} multiline value={block.body} max={320} errors={errors} onChange={(body) => setBlock({ body })} />
                      <Text id={`previews.${key}.link`} label="Link text" value={block.link} max={40} errors={errors} onChange={(link) => setBlock({ link })} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </Anchor>

          <Anchor id="articles">
            <Card title="Articles" description="The heading above the three newest articles. The section is hidden until an article is published.">
              <Text id="articles.eyebrow" label="Label" value={articles.eyebrow} max={40} errors={errors} onChange={(eyebrow) => set("articles", { eyebrow })} />
              <Text id="articles.title" label="Title" value={articles.title} max={120} errors={errors} onChange={(title) => set("articles", { title })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Text id="articles.more" label="Link text on each card" value={articles.more} max={30} errors={errors} onChange={(more) => set("articles", { more })} />
                <Text id="articles.viewAll" label="Button text" hint="Goes to the Articles page." value={articles.viewAll} max={40} errors={errors} onChange={(viewAll) => set("articles", { viewAll })} />
              </div>
              <Link href="/admin/articles" className="text-sm font-semibold text-cms-blue hover:underline">
                Edit the articles →
              </Link>
            </Card>
          </Anchor>
        </div>
      </div>
    </div>
  );
}
