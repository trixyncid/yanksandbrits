"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ImagePlus, Images, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { acceptedImageTypes, maxUploadBytes, type MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils";
import { secondaryAction } from "./page-header";

type Size = { width: number; height: number } | null;

/**
 * Pick an image for a CMS field: upload a new one, reuse an upload, or use a file under /images.
 * `ratio` (width / height) and `minWidth` only warn; editors can still save a mismatched image.
 */
export function MediaPicker({
  id,
  label,
  value,
  onChange,
  spec,
  ratio,
  minWidth,
  siteImages = [],
  error,
  aspectClass = "aspect-[16/9]",
  fit = "cover",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  spec?: string;
  ratio?: number;
  minWidth?: number;
  siteImages?: string[];
  error?: string;
  aspectClass?: string;
  fit?: "cover" | "contain";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [size, setSize] = useState<Size>(null);
  const [open, setOpen] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > maxUploadBytes) {
      setUploadError("Images can be up to 5 MB.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/media", { method: "POST", body });
      const data = (await response.json()) as MediaItem | { message: string };
      if (!response.ok || !("url" in data)) throw new Error("message" in data ? data.message : "Upload failed.");
      onChange(data.url);
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const warning = sizeWarning(size, ratio, minWidth);
  const message = uploadError ?? error;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span id={`${id}-label`} className="text-sm font-semibold text-cms-ink">
          {label}
        </span>
        {spec ? <span className="text-xs text-cms-ink/60">{spec}</span> : null}
      </div>

      <div className={cn("relative overflow-hidden rounded-xl border border-dashed border-cms-field bg-cms-field", aspectClass, message && "border-danger")}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- live preview of an editor-chosen file
          <img
            src={value}
            alt=""
            onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain p-4")}
          />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 grid place-items-center text-sm text-cms-ink/60 transition-colors hover:bg-white/60 hover:text-cms-blue"
            aria-describedby={`${id}-label`}
          >
            <span className="grid place-items-center gap-2">
              <ImagePlus className="size-7" aria-hidden="true" />
              Upload an image
            </span>
          </button>
        )}
        {uploading ? (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-cms-blue">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Uploading…
            </span>
          </span>
        ) : null}
        {value && size ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-cms-navy/80 px-2 py-0.5 font-mono text-[0.7rem] text-white">
            {size.width}×{size.height}
          </span>
        ) : null}
      </div>

      <input ref={input} id={id} type="file" accept={acceptedImageTypes.join(",")} className="sr-only" onChange={upload} tabIndex={-1} />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className={cn(secondaryAction, "min-h-9 px-3.5")}>
          <Upload className="size-4" aria-hidden="true" />
          {value ? "Replace" : "Upload"}
        </button>
        <Library open={open} onOpenChange={setOpen} siteImages={siteImages} onPick={(url) => onChange(url)} />
        {value ? (
          <button type="button" onClick={() => onChange("")} className={cn(secondaryAction, "min-h-9 px-3.5 text-danger hover:text-danger")}>
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-danger">{message}</p> : warning ? <p className="text-xs text-warning">{warning}</p> : null}
    </div>
  );
}

function sizeWarning(size: Size, ratio?: number, minWidth?: number) {
  if (!size) return null;
  if (minWidth && size.width < minWidth) return `This image is ${size.width}px wide; ${minWidth}px or more looks sharp here.`;
  if (ratio && Math.abs(size.width / size.height - ratio) / ratio > 0.08) return "The shape differs from the recommended size, so edges may be cropped.";
  return null;
}

function Library({ open, onOpenChange, siteImages, onPick }: { open: boolean; onOpenChange: (open: boolean) => void; siteImages: string[]; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error();
      setItems(((await response.json()) as { items: MediaItem[] }).items);
    } catch {
      setError("The library could not load. Try again.");
    }
  }

  const pick = (url: string) => {
    onPick(url);
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) void load();
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className={cn(secondaryAction, "min-h-9 px-3.5")}>
          <Images className="size-4" aria-hidden="true" />
          Library
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-cms-field px-5 py-4">
            <Dialog.Title className="text-lg font-semibold">Image library</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-cms-ink/60 hover:bg-cms-field" aria-label="Close">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Choose an uploaded image or a site image.</Dialog.Description>
          <div className="overflow-y-auto p-5">
            <h3 className="text-sm font-semibold">Uploads</h3>
            {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
            {items === null && !error ? <p className="mt-2 text-sm text-cms-ink/60">Loading…</p> : null}
            {items?.length === 0 ? <p className="mt-2 text-sm text-cms-ink/60">Nothing uploaded yet.</p> : null}
            <Grid
              items={(items ?? []).map((item) => ({ url: item.url, caption: `${item.filename}${item.width ? ` · ${item.width}×${item.height}` : ""}` }))}
              onPick={pick}
            />
            {siteImages.length ? (
              <>
                <h3 className="mt-6 text-sm font-semibold">Site images</h3>
                <Grid items={siteImages.map((url) => ({ url, caption: url.replace("/images/", "") }))} onPick={pick} />
              </>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Grid({ items, onPick }: { items: { url: string; caption: string }[]; onPick: (url: string) => void }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <li key={item.url}>
          <button type="button" onClick={() => onPick(item.url)} className="group block w-full text-left">
            {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails */}
            <img src={item.url} alt="" className="aspect-square w-full rounded-lg border border-cms-field object-cover transition group-hover:border-cms-blue group-hover:ring-2 group-hover:ring-cms-blue/20" />
            <span className="mt-1 block truncate text-xs text-cms-ink/60">{item.caption}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
