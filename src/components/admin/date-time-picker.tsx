"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * A date and time picker in the CMS style, replacing the browser's native control.
 * Works in the editor's local time and reports an ISO string (UTC), like `datetime-local` did.
 * The day grid follows the WAI-ARIA date picker pattern: arrows move by day and week,
 * Page Up/Down by month, Home/End to the week's ends, Enter picks, Escape closes.
 */

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, hour) => hour);
const minuteSteps = Array.from({ length: 12 }, (_, step) => step * 5);
const defaultHour = 9;

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
// Keeps the day of the month where it can (31 Jan + 1 month = 28/29 Feb).
const addMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
};
// Monday-first grid of six weeks, so the panel never changes height between months.
function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}
const pad = (value: number) => String(value).padStart(2, "0");
const noop = () => () => {};

const triggerFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const dayLabelFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// Only called while the popup is open, which never happens during server rendering.
function zoneLabel() {
  try {
    const part = new Intl.DateTimeFormat("en-GB", { timeZoneName: "short" }).formatToParts(new Date()).find((item) => item.type === "timeZoneName");
    return part?.value ?? "local time";
  } catch {
    return "local time";
  }
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  label = "Choose date and time",
  describedBy,
  invalid,
}: {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Names the popup for screen readers. */
  label?: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  // Local-time labels differ between the server and the editor's browser, so they wait for hydration.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const selected = value ? new Date(value) : null;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(
            "bg-cms-field hover:bg-cms-gray-25/60 focus-visible:border-cms-blue/40 focus-visible:ring-cms-blue/15 data-[state=open]:border-cms-blue/40 data-[state=open]:ring-cms-blue/15 flex min-h-12 w-full min-w-0 items-center gap-3 rounded-2xl border border-transparent px-4 text-left text-[0.95rem] transition-colors outline-none focus-visible:bg-white focus-visible:ring-3 data-[state=open]:bg-white data-[state=open]:ring-3",
            invalid && "border-danger/50 bg-danger/5",
          )}
        >
          <CalendarDays className="text-cms-blue size-[1.1rem] shrink-0" aria-hidden="true" />
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-cms-ink/45")}>
            {selected && !hydrated ? (
              "…"
            ) : selected ? (
              <>
                {triggerFormat.format(selected)}
                <span className="text-cms-ink/45"> · </span>
                <span className="tabular-nums">
                  {pad(selected.getHours())}:{pad(selected.getMinutes())}
                </span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="text-cms-ink/50 size-4 shrink-0" aria-hidden="true" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            collisionPadding={12}
            aria-label={label}
            className="font-cms text-cms-ink ring-cms-gray-25 z-[var(--z-modal)] w-[min(21rem,calc(100vw-1.5rem))] rounded-[1.5rem] bg-white p-4 shadow-[0_24px_60px_rgb(13_21_56/0.18)] ring-1 motion-safe:animate-[cms-pop-in_140ms_ease-out]"
          >
            <Panel selected={selected} onChange={onChange} close={() => setOpen(false)} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {selected ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-cms-ink/60 ring-cms-gray-25 hover:text-cms-ink grid min-h-12 shrink-0 place-items-center rounded-2xl px-3 ring-1 transition-colors hover:bg-white"
          aria-label={`Clear: ${label}`}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * The popup's contents. Mounted only while the popup is open, which only happens in the browser,
 * so reading the current date here is safe under Cache Components (no `new Date()` while prerendering).
 * Each opening starts again at the chosen day, or today.
 */
function Panel({ selected, onChange, close }: { selected: Date | null; onChange: (value: string | null) => void; close: () => void }) {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => selected ?? today);
  const [focused, setFocused] = useState(() => selected ?? today);
  const grid = useRef<HTMLDivElement>(null);

  // Keep keyboard focus on the focused day as it moves.
  useEffect(() => {
    const frame = requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [focused]);

  const emit = (day: Date, hour: number, minute: number) => onChange(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute).toISOString());
  const hour = selected?.getHours() ?? defaultHour;
  const minute = selected?.getMinutes() ?? 0;
  const minutes = minuteSteps.includes(minute) ? minuteSteps : [...minuteSteps, minute].sort((a, b) => a - b);

  const pick = (day: Date) => {
    emit(day, hour, minute);
    setFocused(day);
  };

  const moveFocus = (next: Date) => {
    setFocused(next);
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) setMonth(next);
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
      Home: () => addDays(focused, -((focused.getDay() + 6) % 7)),
      End: () => addDays(focused, 6 - ((focused.getDay() + 6) % 7)),
    };
    // Enter and Space pick the day the grid has focused, even if DOM focus has not caught up yet.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(focused);
      return;
    }
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    moveFocus(step());
  };

  const tomorrow = addDays(today, 1);
  const quick = [
    { label: "Now", run: () => onChange(new Date().toISOString()) },
    { label: "Tomorrow, 09:00", run: () => emit(tomorrow, 9, 0) },
    { label: "Next Monday, 09:00", run: () => emit(addDays(today, (8 - today.getDay()) % 7 || 7), 9, 0) },
  ];

  const selectClass =
    "h-10 cursor-pointer appearance-none rounded-xl bg-white pr-8 pl-3 text-sm font-semibold tabular-nums ring-1 ring-cms-gray-25 outline-none hover:ring-cms-blue/30 focus-visible:ring-3 focus-visible:ring-cms-blue/25 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      {/* Month header, styled like the dashboard cards: title left, round controls right. */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold tracking-tight" aria-live="polite">
          {monthFormat.format(month)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => moveFocus(addMonths(focused, -1))}
            className="text-cms-ink/70 ring-cms-gray-25 hover:bg-cms-field hover:text-cms-ink grid size-9 place-items-center rounded-full ring-1 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveFocus(addMonths(focused, 1))}
            className="text-cms-ink/70 ring-cms-gray-25 hover:bg-cms-field hover:text-cms-ink grid size-9 place-items-center rounded-full ring-1 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={grid} role="grid" aria-label={monthFormat.format(month)} onKeyDown={onGridKey} className="mt-3">
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((day) => (
            <span key={day} role="columnheader" aria-label={day} className="text-cms-ink/45 py-1.5 text-center text-[0.7rem] font-semibold tracking-wide uppercase">
              {day.slice(0, 2)}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 gap-y-0.5">
            {monthGrid(month)
              .slice(week * 7, week * 7 + 7)
              .map((day) => {
                const inMonth = day.getMonth() === month.getMonth();
                const isSelected = selected ? sameDay(day, selected) : false;
                const isToday = sameDay(day, today);
                const isFocused = sameDay(day, focused);
                return (
                  <div key={day.toISOString()} role="gridcell" aria-selected={isSelected} className="grid place-items-center">
                    <button
                      type="button"
                      tabIndex={isFocused ? 0 : -1}
                      data-focused={isFocused}
                      onClick={() => pick(day)}
                      aria-label={`${dayLabelFormat.format(day)}${isToday ? ", today" : ""}`}
                      aria-pressed={isSelected}
                      className={cn(
                        "focus-visible:ring-cms-blue/30 relative grid size-10 place-items-center rounded-xl text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-3",
                        isSelected
                          ? "bg-cms-blue font-bold text-white shadow-[0_6px_14px_rgb(37_60_161/0.3)]"
                          : inMonth
                            ? "text-cms-ink hover:bg-cms-blue-10 hover:text-cms-blue"
                            : "text-cms-ink/30 hover:bg-cms-field",
                      )}
                    >
                      {day.getDate()}
                      {/* Today: a small dot, so it still shows when another day is selected. */}
                      {isToday ? <span className={cn("absolute bottom-1.5 size-1 rounded-full", isSelected ? "bg-white" : "bg-cms-blue")} aria-hidden="true" /> : null}
                    </button>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Time */}
      <div className="bg-cms-field mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5">
        <span className="text-sm font-semibold">Time</span>
        <div className="flex items-center gap-1.5">
          <label className="relative">
            <span className="sr-only">Hour</span>
            <select className={selectClass} value={hour} disabled={!selected} onChange={(event) => selected && emit(selected, Number(event.target.value), minute)}>
              {hours.map((value) => (
                <option key={value} value={value}>
                  {pad(value)}
                </option>
              ))}
            </select>
            <ChevronDown className="text-cms-ink/50 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" aria-hidden="true" />
          </label>
          <span className="text-cms-ink/50 font-bold" aria-hidden="true">
            :
          </span>
          <label className="relative">
            <span className="sr-only">Minute</span>
            <select className={selectClass} value={minute} disabled={!selected} onChange={(event) => selected && emit(selected, hour, Number(event.target.value))}>
              {minutes.map((value) => (
                <option key={value} value={value}>
                  {pad(value)}
                </option>
              ))}
            </select>
            <ChevronDown className="text-cms-ink/50 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" aria-hidden="true" />
          </label>
        </div>
      </div>
      <p className="text-cms-ink/50 mt-1.5 px-1 text-[0.7rem]">{selected ? `In your time zone (${zoneLabel()}).` : "Pick a day first. Defaults to 09:00."}</p>

      {/* Quick picks */}
      <div className="border-cms-gray-25 mt-3 flex flex-wrap gap-1.5 border-t pt-3">
        {quick.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.run();
              close();
            }}
            className="text-cms-blue ring-cms-blue/20 hover:bg-cms-blue-10 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            onChange(null);
            close();
          }}
          className="text-cms-ink/60 hover:bg-cms-field hover:text-cms-ink rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
        >
          Clear
        </button>
        <Popover.Close className="bg-cms-blue hover:bg-cms-blue-deep rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_14px_rgb(37_60_161/0.25)] transition-colors">
          Done
        </Popover.Close>
      </div>
    </>
  );
}
