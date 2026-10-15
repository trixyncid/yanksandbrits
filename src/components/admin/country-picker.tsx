"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Globe, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type CountryOption = { code: string; name: string };

/** The flag emoji for an ISO alpha-2 code, built from regional indicator letters. */
const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));

// Accents and case are ignored, so "cote" finds "Côte d'Ivoire".
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * A searchable country dropdown in the CMS style (WAI-ARIA combobox with a listbox).
 * Stores the country's English name, which the site matches against its country filter.
 */
export function CountryPicker({
  id,
  value,
  onChange,
  countries,
  suggested = [],
  describedBy,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (name: string) => void;
  countries: CountryOption[];
  /** ISO codes listed first, e.g. countries other campaigns already use. */
  suggested?: string[];
  describedBy?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = countries.find((country) => country.name.toLowerCase() === value.trim().toLowerCase()) ?? null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-haspopup="listbox"
        className={cn(
          "flex min-h-12 w-full min-w-0 items-center gap-3 rounded-2xl border border-transparent bg-cms-field px-4 text-left text-[0.95rem] transition-colors outline-none hover:bg-cms-gray-25/60 focus-visible:border-cms-blue/40 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-cms-blue/15 data-[state=open]:border-cms-blue/40 data-[state=open]:bg-white data-[state=open]:ring-3 data-[state=open]:ring-cms-blue/15",
          invalid && "border-danger/50 bg-danger/5",
        )}
      >
        {current ? (
          <span className="text-lg leading-none" aria-hidden="true">
            {flag(current.code)}
          </span>
        ) : (
          <Globe className="size-[1.1rem] shrink-0 text-cms-blue" aria-hidden="true" />
        )}
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-cms-ink/45")}>{current?.name ?? (value || "Choose a country")}</span>
        <ChevronDown className="size-4 shrink-0 text-cms-ink/50" aria-hidden="true" />
      </Popover.Trigger>
      {value && !current ? <p className="mt-1.5 text-xs text-warning">“{value}” is not a standard country name. Choose one from the list so the site filter matches it.</p> : null}

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-[var(--z-modal)] w-[var(--radix-popover-trigger-width)] min-w-[18rem] overflow-hidden rounded-[1.5rem] bg-white font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.18)] ring-1 ring-cms-gray-25 motion-safe:animate-[cms-pop-in_140ms_ease-out]"
        >
          <Panel
            countries={countries}
            suggested={suggested}
            selected={current?.code ?? null}
            onPick={(country) => {
              onChange(country.name);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Search box and list. Mounted only while open, so each opening starts with an empty search. */
function Panel({ countries, suggested, selected, onPick }: { countries: CountryOption[]; suggested: string[]; selected: string | null; onPick: (country: CountryOption) => void }) {
  const [query, setQuery] = useState("");
  const listId = useId();
  const list = useRef<HTMLUListElement>(null);

  // While searching: one filtered list, names that start with the query first.
  // Otherwise: suggested countries, then everything A to Z.
  const groups = useMemo(() => {
    const q = fold(query.trim());
    if (q) {
      const hits = countries.filter((country) => fold(country.name).includes(q) || country.code.toLowerCase() === q);
      hits.sort((a, b) => Number(!fold(a.name).startsWith(q)) - Number(!fold(b.name).startsWith(q)));
      return [{ label: null, items: hits }];
    }
    const top = suggested.map((code) => countries.find((country) => country.code === code)).filter((country): country is CountryOption => Boolean(country));
    return [
      ...(top.length ? [{ label: "Suggested", items: top }] : []),
      { label: "All countries", items: countries },
    ];
  }, [countries, suggested, query]);

  const options = groups.flatMap((group) => group.items.map((country) => ({ country })));
  // Where each group's rows start in the flat option list, for keyboard navigation.
  const offsets = groups.map((_, groupIndex) => groups.slice(0, groupIndex).reduce((sum, group) => sum + group.items.length, 0));
  const start = Math.max(0, query ? 0 : options.findIndex((option) => option.country.code === selected));
  const [active, setActive] = useState(start);
  const activeIndex = Math.min(active, Math.max(0, options.length - 1));

  // Keep the active option in view as it moves.
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = options.length - 1;
    const moves: Record<string, number> = { ArrowDown: Math.min(last, activeIndex + 1), ArrowUp: Math.max(0, activeIndex - 1), PageDown: Math.min(last, activeIndex + 8), PageUp: Math.max(0, activeIndex - 8) };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) onPick(option.country);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-cms-gray-25 px-4 transition-colors focus-within:bg-cms-blue-10/60">
        <Search className="size-4 shrink-0 text-cms-ink/45" aria-hidden="true" />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={options[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-label="Search countries"
          placeholder="Search 250 countries"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cms-ink/40 focus-visible:outline-none!"
        />
      </div>

      <ul ref={list} id={listId} role="listbox" aria-label="Countries" className="max-h-72 overflow-y-auto overscroll-contain p-1.5">
        {options.length === 0 ? <li className="px-3 py-6 text-center text-sm text-cms-ink/55">No country matches “{query}”.</li> : null}
        {groups.map((group, groupIndex) => (
          <li key={group.label ?? "hits"} role="presentation">
            {group.label ? <p className="px-3 pt-2 pb-1 text-[0.68rem] font-semibold tracking-[0.12em] text-cms-ink/45 uppercase">{group.label}</p> : null}
            <ul role="group" aria-label={group.label ?? "Matches"}>
              {group.items.map((country, itemIndex) => {
                const optionIndex = offsets[groupIndex] + itemIndex;
                const isActive = optionIndex === activeIndex;
                const isSelected = country.code === selected;
                return (
                  <li
                    key={`${group.label ?? "hit"}-${country.code}`}
                    id={`${listId}-${optionIndex}`}
                    data-index={optionIndex}
                    role="option"
                    aria-selected={isSelected}
                    onMouseMove={() => setActive(optionIndex)}
                    onClick={() => onPick(country)}
                    className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm", isActive ? "bg-cms-blue-10 text-cms-blue" : "text-cms-ink")}
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {flag(country.code)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{country.name}</span>
                    {isSelected ? <Check className="size-4 shrink-0 text-cms-blue" aria-hidden="true" /> : <span className="font-mono text-[0.7rem] text-cms-ink/35">{country.code}</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
