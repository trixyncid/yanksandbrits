"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteArticle } from "@/actions/cms";
import { secondaryAction } from "../page-header";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={`${secondaryAction} text-danger hover:border-danger/40 hover:text-danger`}>
          <Trash2 className="size-4" aria-hidden="true" />
          Delete article
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold">Delete this article?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">
            “{title || "Untitled"}” will be removed from the CMS and the site. This cannot be undone.
          </Dialog.Description>
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
                  // On success the action redirects to the article list.
                  const result = await deleteArticle(id);
                  if (result && !result.ok) setError(result.message);
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
