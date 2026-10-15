"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { ArrowDown, ArrowUp, ExternalLink, LoaderCircle, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteExpoAction,
  deleteFaqAction,
  deletePersonAction,
  deleteProgram,
  deleteStoryAction,
  deleteTestimonialAction,
  moveExpoAction,
  moveFaqAction,
  moveProgram,
  movePersonAction,
  moveStoryAction,
  moveTestimonialAction,
} from "@/actions/cms";
import { cn } from "@/lib/utils";
import { secondaryAction } from "./page-header";

const item =
  "flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-35 data-[highlighted]:bg-cms-field";

type Kind = "counsellor" | "tutor" | "program" | "testimonial" | "expo" | "story" | "faq";

const movers = { program: moveProgram, testimonial: moveTestimonialAction, expo: moveExpoAction, story: moveStoryAction, faq: moveFaqAction } as const;
const deleters = { program: deleteProgram, testimonial: deleteTestimonialAction, expo: deleteExpoAction, story: deleteStoryAction, faq: deleteFaqAction } as const;
const moveRow = (kind: Kind, id: string, direction: "up" | "down") => (kind === "counsellor" || kind === "tutor" ? movePersonAction(kind, id, direction) : movers[kind](id, direction));
const deleteRow = (kind: Kind, id: string) => (kind === "counsellor" || kind === "tutor" ? deletePersonAction(kind, id) : deleters[kind](id));

const deleteNote: Record<Kind, string> = {
  counsellor: "Their profile is removed from the CMS and the site. This cannot be undone.",
  tutor: "Their profile is removed from the CMS and the site. This cannot be undone.",
  program: "It is removed from the CMS, the site menu, and the program list. This cannot be undone.",
  testimonial: "The quote is removed from the CMS and the home page. This cannot be undone.",
  story: "The story is removed from the CMS and the site. Keep the signed consent on file. This cannot be undone.",
  faq: "The question is removed from the FAQ, the Contact page, and program pages. This cannot be undone.",
  expo: "It is removed from the CMS, the Expo page, and the home page. To take it down for a while, use Hide instead. This cannot be undone.",
};

/** The row's ⋯ button: a popup menu of everything you can do to one person or program. */
export function RowActions({
  kind,
  id,
  name,
  editHref,
  siteHref,
  first,
  last,
  canDelete,
}: {
  kind: Kind;
  id: string;
  name: string;
  editHref: string;
  siteHref: string | null;
  first: boolean;
  last: boolean;
  canDelete: boolean;
}) {
  const [moving, startMove] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const move = (direction: "up" | "down") => startMove(async () => void (await moveRow(kind, id, direction)));

  return (
    <>
      <Menu.Root modal={false}>
        <Menu.Trigger
          className="grid size-9 place-items-center rounded-xl text-cms-ink/60 ring-1 ring-cms-gray-25 transition-colors hover:bg-cms-field hover:text-cms-ink data-[state=open]:bg-cms-blue data-[state=open]:text-white data-[state=open]:ring-cms-blue"
          aria-label={`Actions for ${name}`}
          aria-busy={moving}
        >
          {moving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <MoreHorizontal className="size-[1.15rem]" aria-hidden="true" />}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="end"
            sideOffset={6}
            collisionPadding={12}
            className="z-[var(--z-modal)] w-56 rounded-[1.25rem] bg-white p-1.5 font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.18)] ring-1 ring-cms-gray-25 motion-safe:animate-[cms-pop-in_140ms_ease-out]"
          >
            <Menu.Item asChild className={item}>
              <Link href={editHref}>
                <PencilLine className="size-4 text-cms-blue" aria-hidden="true" />
                Edit {kind}
              </Link>
            </Menu.Item>
            {siteHref ? (
              <Menu.Item asChild className={item}>
                <a href={siteHref} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4 text-cms-blue" aria-hidden="true" />
                  View on site
                </a>
              </Menu.Item>
            ) : null}
            <Menu.Separator className="my-1.5 h-px bg-cms-gray-25" />
            <Menu.Item className={item} disabled={first || moving} onSelect={() => move("up")}>
              <ArrowUp className="size-4 text-cms-ink/55" aria-hidden="true" />
              Move up
            </Menu.Item>
            <Menu.Item className={item} disabled={last || moving} onSelect={() => move("down")}>
              <ArrowDown className="size-4 text-cms-ink/55" aria-hidden="true" />
              Move down
            </Menu.Item>
            {canDelete ? (
              <>
                <Menu.Separator className="my-1.5 h-px bg-cms-gray-25" />
                <Menu.Item className={cn(item, "text-danger data-[highlighted]:bg-danger/5")} onSelect={() => setConfirming(true)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Menu.Item>
              </>
            ) : null}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      <Dialog.Root
        open={confirming}
        onOpenChange={(open) => {
          setConfirming(open);
          if (!open) setError(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] bg-white p-6 font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.2)]">
            <Dialog.Title className="text-lg font-bold">Delete {name}?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">
              {deleteNote[kind]}
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
                disabled={deleting}
                onClick={() =>
                  startDelete(async () => {
                    // On success the action redirects back to this list.
                    const result = await deleteRow(kind, id);
                    if (result && !result.ok) setError(result.message);
                  })
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-danger px-5 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-60"
              >
                {deleting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
