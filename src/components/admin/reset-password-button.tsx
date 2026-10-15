"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, KeyRound, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { resetUserPasswordAction } from "@/actions/cms";
import { primaryAction, secondaryAction } from "./page-header";
import { useToast } from "./toast";

/** Admins only: gives an editor a new temporary password, shown once. */
export function ResetPasswordButton({ id, name }: { id: string; name: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const reset = () =>
    startTransition(async () => {
      const result = await resetUserPasswordAction(id);
      if (!result.ok) {
        toast({ tone: "error", title: "Password not reset", text: result.message });
        setOpen(false);
        return;
      }
      setPassword(result.password);
    });

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      toast({ tone: "error", text: "Could not copy. Select the password and copy it instead." });
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // The password is shown once: closing forgets it.
        if (!next) {
          setPassword(null);
          setCopied(false);
        }
      }}
    >
      <Dialog.Trigger
        className="grid size-8 place-items-center rounded-lg text-cms-ink/60 transition-colors hover:bg-cms-blue-10 hover:text-cms-blue"
        aria-label={`Reset ${name}'s password`}
        title="Reset password"
      >
        <KeyRound className="size-4" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-cms-navy/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 font-cms text-cms-ink shadow-[0_24px_60px_rgb(13_21_56/0.18)] motion-safe:animate-[cms-pop-in_140ms_ease-out]">
          {password ? (
            <>
              <Dialog.Title className="text-lg font-semibold">New password for {name}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">
                Shown only this once. Send it to them privately, then ask them to change it under Account after signing in. They were signed out everywhere.
              </Dialog.Description>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-cms-field p-2 pl-4">
                <code className="flex-1 font-mono text-base font-semibold tracking-wide select-all">{password}</code>
                <button type="button" onClick={copy} className={secondaryAction}>
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <Dialog.Close className={primaryAction}>Done</Dialog.Close>
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="text-lg font-semibold">Reset {name}&apos;s password?</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-cms-ink/60">
                Their current password stops working and they are signed out on every device. You get a new temporary password to send them.
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close className={secondaryAction}>Cancel</Dialog.Close>
                <button type="button" onClick={reset} disabled={pending} className={primaryAction}>
                  {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
                  {pending ? "Resetting…" : "Reset password"}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
