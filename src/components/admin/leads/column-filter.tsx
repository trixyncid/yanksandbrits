"use client";

import * as Popover from "@radix-ui/react-popover";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ChevronDown, Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FacetOption } from "@/lib/cms/leads";
import { filtersQuery, type FacetKey, type LeadFilters } from "@/lib/leads/filters";
import { cn } from "@/lib/utils";

type Sort = { value: LeadFilters["sort"]; label: string; descending?: boolean };

/**
 * A table header with an Excel-style menu: sort, then tick the values to show. Everything ticked means no
 * filter, as in Excel. Applying navigates, so the filtered view has its own URL and survives a reload.
 */
export function ColumnFilter({
  label,
  filters,
  facet,
  options = [],
  sorts = [],
  align = "start",
}: {
  label: string;
  filters: LeadFilters;
  facet?: FacetKey;
  options?: FacetOption[];
  sorts?: Sort[];
  align?: "start" | "end";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = facet ? filters[facet] : [];
  const filtered = selected.length > 0;
  const activeSort = sorts.find((sort) => sort.value === filters.sort);
  const go = (overrides: Partial<LeadFilters>) => {
    setOpen(false);
    router.push(`/admin/leads${filtersQuery(filters, { ...overrides, page: 1 })}`);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          "-mx-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-cms-field hover:text-cms-ink data-[state=open]:bg-cms-field",
          filtered || activeSort ? "text-cms-blue" : "text-cms-ink/50",
        )}
        aria-label={`${label}: sort and filter${filtered ? `, ${selected.length} selected` : ""}`}
      >
        {label}
        {activeSort ? (
          activeSort.descending ? <ArrowDownWideNarrow className="size-3.5" aria-hidden="true" /> : <ArrowUpNarrowWide className="size-3.5" aria-hidden="true" />
        ) : null}
        {filtered ? <Filter className="size-3.5 fill-current" aria-hidden="true" /> : <ChevronDown className="size-3.5" aria-hidden="true" />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          collisionPadding={12}
          className="z-[var(--z-modal)] w-[17rem] overflow-hidden rounded-[1.25rem] bg-white font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.18)] ring-1 ring-cms-gray-25 motion-safe:animate-[cms-pop-in_140ms_ease-out]"
        >
          {sorts.length ? (
            <div className="grid p-1.5">
              {sorts.map((sort) => {
                const Icon = sort.descending ? ArrowDownWideNarrow : ArrowUpNarrowWide;
                const current = filters.sort === sort.value;
                return (
                  <button
                    key={sort.value}
                    type="button"
                    onClick={() => go({ sort: sort.value })}
                    className={cn("flex min-h-9 items-center gap-2.5 rounded-xl px-3 text-left text-sm transition-colors hover:bg-cms-field", current && "font-semibold text-cms-blue")}
                  >
                    <Icon className="size-4 shrink-0 text-cms-ink/50" aria-hidden="true" />
                    <span className="flex-1">{sort.label}</span>
                    {current ? <Check className="size-4" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
          {facet ? <Values key={String(open)} label={label} options={options} selected={selected} onApply={(values) => go({ [facet]: values })} divider={sorts.length > 0} /> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Values({ label, options, selected, onApply, divider }: { label: string; options: FacetOption[]; selected: string[]; onApply: (values: string[]) => void; divider: boolean }) {
  // No filter means everything is shown, so every box starts ticked.
  const [ticked, setTicked] = useState(() => new Set(selected.length ? selected : options.map((option) => option.value)));
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options;
  }, [options, query]);
  const allTicked = visible.length > 0 && visible.every((option) => ticked.has(option.value));

  const toggle = (value: string) =>
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  const toggleAll = () =>
    setTicked((current) => {
      const next = new Set(current);
      for (const option of visible) if (allTicked) next.delete(option.value);
      else next.add(option.value);
      return next;
    });
  // Ticking every value is the same as no filter, so the URL stays clean.
  const apply = () => onApply(options.every((option) => ticked.has(option.value)) ? [] : options.filter((option) => ticked.has(option.value)).map((option) => option.value));

  return (
    <div className={cn(divider && "border-t border-cms-gray-25")}>
      {options.length > 6 ? (
        <div className="p-2 pb-0">
          <label className="relative block">
            <span className="sr-only">Search {label.toLowerCase()}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-cms-ink/40" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-h-9 w-full rounded-xl bg-cms-field pr-3 pl-8 text-sm outline-none placeholder:text-cms-ink/40 focus:ring-2 focus:ring-cms-blue/30"
            />
          </label>
        </div>
      ) : null}
      {options.length === 0 ? (
        <p className="px-4 py-5 text-center text-sm text-cms-ink/55">Nothing to filter in this view.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
          <CheckRow checked={allTicked} onChange={toggleAll} label="(Select all)" strong />
          {visible.map((option) => (
            <CheckRow key={option.value} checked={ticked.has(option.value)} onChange={() => toggle(option.value)} label={option.label} count={option.count} />
          ))}
          {visible.length === 0 ? <p className="px-3 py-3 text-sm text-cms-ink/55">No match.</p> : null}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-cms-gray-25 p-2">
        <button type="button" onClick={() => onApply([])} disabled={selected.length === 0} className="min-h-9 rounded-xl px-3 text-sm font-semibold text-cms-ink/60 transition-colors hover:bg-cms-field hover:text-cms-ink disabled:opacity-40">
          Clear filter
        </button>
        <button type="button" onClick={apply} disabled={ticked.size === 0 || options.length === 0} className="min-h-9 rounded-xl bg-cms-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-cms-blue-deep disabled:opacity-50">
          Apply
        </button>
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, label, count, strong = false }: { checked: boolean; onChange: () => void; label: string; count?: number; strong?: boolean }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm transition-colors hover:bg-cms-field">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 shrink-0 accent-cms-blue" />
      <span className={cn("min-w-0 flex-1 truncate", strong && "font-semibold")}>{label}</span>
      {count !== undefined ? <span className="text-xs text-cms-ink/45 tabular-nums">{count}</span> : null}
    </label>
  );
}
