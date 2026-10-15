"use client";

import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { Field, Input } from "./field";
import { primaryAction } from "./page-header";
import { useToast } from "./toast";

export function PasswordForm() {
  const form = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== String(data.get("confirm") ?? "")) {
      toast({ tone: "error", title: "Passwords don’t match", text: "Type the same new password in both fields." });
      return;
    }
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(data.get("currentPassword") ?? ""),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      toast({ tone: "error", title: "Password not changed", text: error.message ?? "Check your current password and try again." });
      return;
    }
    form.current?.reset();
    toast({ tone: "success", title: "Password changed", text: "Other devices were signed out." });
  }

  return (
    <form ref={form} onSubmit={onSubmit} className="grid gap-4">
      <Field id="currentPassword" label="Current password">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field id="newPassword" label="New password" hint="At least 10 characters.">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={10} required aria-describedby="newPassword-hint" />
      </Field>
      <Field id="confirm" label="Confirm new password">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <button type="submit" disabled={pending} className={primaryAction}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
