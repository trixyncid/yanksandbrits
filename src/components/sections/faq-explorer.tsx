"use client";

import { track } from "@/lib/analytics/track";
import type { Faq } from "@/lib/faqs/schema";
import { cn } from "@/lib/utils";
import * as Accordion from "@radix-ui/react-accordion";
import { Check, ChevronDown, Link2, Search, X } from "lucide-react";
import { Fragment, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

// The URL fragment (#id) as React state: "" on the server and during hydration, so both agree.
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Wraps each match of the query in <mark>, ignoring case. */
function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded bg-accent-soft px-0.5 text-brand">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/**
 * Search, category tabs, and grouped answers. Opening an answer puts it in the address bar
 * (/faq#id), so it can be shared, and visiting that address opens it.
 */
export function FaqExplorer({ faqs, empty }: { faqs: Faq[]; empty: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const hash = useSyncExternalStore(subscribe, readHash, () => "");

  const matches = useMemo(() => {
    const q = fold(query.trim());
    return q ? faqs.filter((faq) => fold(`${faq.question} ${faq.answer} ${faq.category}`).includes(q)) : faqs;
  }, [faqs, query]);
  const categories = [...new Set(faqs.map((faq) => faq.category))];
  const visible = category ? matches.filter((faq) => faq.category === category) : matches;
  const groups = categories.map((name) => ({ name, items: visible.filter((faq) => faq.category === name) })).filter((group) => group.items.length);

  // The linked answer stays open until the visitor closes it.
  const linked = hash && faqs.some((faq) => faq.id === hash) && !dismissed.includes(hash) ? hash : null;
  const value = linked ? [...new Set([...open, linked])] : open;

  const onValueChange = (next: string[]) => {
    if (linked && !next.includes(linked)) setDismissed((current) => [...current, linked]);
    const added = next.find((id) => !value.includes(id));
    if (added) {
      window.history.replaceState(null, "", `#${added}`);
      track({ name: "faq_expand", id: added });
    }
    setOpen(next);
  };

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
      setCopied(id);
      setTimeout(() => setCopied((current) => (current === id ? null : current)), 1800);
    } catch {}
  };

  if (faqs.length === 0) return <>{empty}</>;

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions, e.g. visa, fees, parents"
          aria-label="Search the questions"
          className="h-14 w-full rounded-full border border-line bg-white pr-14 pl-13 text-base shadow-[0_10px_30px_rgb(42_45_52/0.06)] outline-none placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-logo-soft hover:text-ink" aria-label="Clear the search">
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by topic">
        {[null, ...categories].map((name) => {
          const count = name ? matches.filter((faq) => faq.category === name).length : matches.length;
          const active = category === name;
          return (
            <button
              key={name ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(name)}
              disabled={!active && count === 0}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-40",
                active ? "bg-brand text-white" : "border border-line bg-white text-ink hover:border-brand hover:text-brand",
              )}
            >
              {name ?? "All topics"}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/20" : "bg-logo-soft text-muted")}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {query ? `${visible.length} answer${visible.length === 1 ? "" : "s"} for ${query}` : ""}
      </p>

      {groups.length === 0 ? (
        <div className="mt-10 rounded-[1.6rem] border-2 border-dashed border-line px-6 py-12 text-center">
          <p className="text-lg font-semibold">No answers mention “{query}”.</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-muted">Try a shorter word, or ask us directly below.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-semibold hover:border-brand hover:text-brand">
            Show all questions
          </button>
        </div>
      ) : (
        <Accordion.Root type="multiple" value={value} onValueChange={onValueChange} className="mt-10 grid gap-10">
          {groups.map((group) => (
            <section key={group.name} aria-labelledby={`topic-${fold(group.name).replace(/\W+/g, "-")}`}>
              <h2 id={`topic-${fold(group.name).replace(/\W+/g, "-")}`} className="flex items-baseline gap-3 text-sm font-semibold tracking-[0.16em] text-brand uppercase">
                {group.name}
                <span className="text-xs tracking-normal text-muted normal-case tabular-nums">
                  {group.items.length} question{group.items.length === 1 ? "" : "s"}
                </span>
              </h2>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-[1.6rem] border border-line bg-white">
                {group.items.map((faq) => (
                  <Accordion.Item key={faq.id} value={faq.id} id={faq.id} className="scroll-mt-28">
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold transition-colors hover:bg-logo-soft/50 data-[state=open]:text-brand md:px-6">
                        <span>{highlight(faq.question, query)}</span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-logo-soft text-ink transition-[transform,background-color] duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:bg-brand group-data-[state=open]:text-white">
                          <ChevronDown className="size-4" aria-hidden="true" />
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="accordion-content overflow-hidden">
                      <div className="grid gap-3 px-5 pb-5 text-base leading-7 text-muted md:px-6">
                        {faq.paragraphs.map((paragraph, index) => (
                          <p key={index}>{highlight(paragraph, query)}</p>
                        ))}
                        <button type="button" onClick={() => copyLink(faq.id)} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep">
                          {copied === faq.id ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
                          {copied === faq.id ? "Link copied" : "Copy link to this answer"}
                        </button>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </div>
            </section>
          ))}
        </Accordion.Root>
      )}
    </div>
  );
}
