"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { panel, secondaryAction } from "./page-header";

export function Card({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className={cn(panel, "p-5 sm:p-7")}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-cms-ink/60">{description}</p>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function ListEditor<T>({
  items,
  max,
  addLabel,
  numbered = false,
  empty,
  onChange,
  render,
}: {
  items: T[];
  max: number;
  addLabel: string;
  numbered?: boolean;
  empty: T;
  onChange: (items: T[]) => void;
  render: (value: T, onValue: (value: T) => void, index: number) => ReactNode;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      {items.length === 0 ? <p className="rounded-xl border border-dashed border-cms-field px-4 py-6 text-center text-sm text-cms-ink/60">Nothing here yet.</p> : null}
      <ol className="grid gap-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            {numbered ? (
              <span className="mt-2 grid size-7 shrink-0 place-items-center rounded-full bg-cms-blue-10 font-mono text-xs font-semibold text-cms-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">{render(item, (value) => onChange(items.map((current, i) => (i === index ? value : current))), index)}</div>
            <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
              <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowUp className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Move down" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowDown className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Remove" danger onClick={() => onChange(items.filter((_, i) => i !== index))}>
                <X className="size-4" aria-hidden="true" />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      {items.length < max ? (
        <button type="button" onClick={() => onChange([...items, empty])} className={cn(secondaryAction, "justify-self-start")}>
          <Plus className="size-4" aria-hidden="true" />
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export function IconButton({ label, disabled, danger, onClick, children }: { label: string; disabled?: boolean; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-cms-ink/60 transition-colors hover:bg-cms-field hover:text-cms-ink disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:bg-danger/5 hover:text-danger",
      )}
    >
      {children}
    </button>
  );
}

/** Chips for short lists such as majors or subjects: type and press Enter or comma. */
export function ChipsInput({
  id,
  values,
  onChange,
  max = 12,
  placeholder,
  describedBy,
}: {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  max?: number;
  placeholder?: string;
  describedBy?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const next = raw.split(",").map((item) => item.trim()).filter(Boolean);
    if (!next.length) return;
    onChange([...new Set([...values, ...next])].slice(0, max));
    setDraft("");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-transparent bg-cms-field p-2.5 focus-within:border-cms-blue/40 focus-within:bg-white focus-within:ring-3 focus-within:ring-cms-blue/15">
      {values.map((value) => (
        <span key={value} className="inline-flex items-center gap-1 rounded-full bg-cms-blue-10 py-0.5 pr-1 pl-2.5 text-xs font-semibold text-cms-blue">
          {value}
          <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} aria-label={`Remove ${value}`} className="rounded-full p-0.5 hover:bg-cms-blue/10">
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => (event.target.value.endsWith(",") ? add(event.target.value) : setDraft(event.target.value))}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={values.length ? "" : placeholder}
        aria-describedby={describedBy}
        maxLength={80}
        className="min-w-28 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none focus-visible:outline-none"
      />
    </div>
  );
}


/** Sticky bar at the top of a CMS editor: status pill, save state, and the main buttons. */
export function SaveBar({
  status,
  pending,
  dirty,
  saved,
  children,
}: {
  status: { label: string; tone: "success" | "muted" | "brand" | "warning" };
  pending: boolean;
  dirty: boolean;
  saved: boolean;
  children: ReactNode;
}) {
  const tones = { success: "bg-cms-blue-10 text-cms-blue", muted: "bg-cms-gray-25 text-cms-ink/65", brand: "bg-white text-cms-blue ring-1 ring-inset ring-cms-blue-20", warning: "bg-warning/10 text-warning" };
  return (
    <div className="sticky top-[var(--cms-top)] z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 bg-cms-canvas/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:rounded-b-[1.5rem] lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[status.tone])}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {status.label}
        </span>
        <span className={cn("truncate text-sm", dirty ? "text-warning" : "text-cms-ink/60")}>
          {pending ? "Saving…" : dirty ? "Unsaved changes" : saved ? "All changes saved" : "Not saved yet"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Warns before leaving the page with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

export function DeleteButton({
  label,
  title,
  description,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => Promise<{ ok: boolean; message?: string } | void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={`${secondaryAction} text-danger hover:border-danger/40 hover:text-danger`}>
          <Trash2 className="size-4" aria-hidden="true" />
          {label}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">{description}</Dialog.Description>
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
                  const result = await onConfirm();
                  if (result && !result.ok) setError(result.message ?? "Could not delete.");
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

