"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { createUser, type UserFormState } from "@/actions/cms";
import { describedBy, Field, Input, Select } from "./field";
import { primaryAction } from "./page-header";
import { useToast } from "./toast";

export function UserForm() {
  const [state, action, pending] = useActionState<UserFormState, FormData>(createUser, null);
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const errors = state?.fieldErrors ?? {};

  // Each submit returns a new state object, so this runs once per result.
  useEffect(() => {
    if (!state) return;
    if (state.ok) form.current?.reset();
    toast({ tone: state.ok ? "success" : "error", text: state.message });
  }, [state, toast]);

  return (
    <form ref={form} action={action} className="grid gap-4">
      <Field id="name" label="Name" error={errors.name}>
        <Input id="name" name="name" required maxLength={80} autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name", errors.name)} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <Input id="email" name="email" type="email" required autoComplete="off" aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email", errors.email)} />
      </Field>
      <Field id="password" label="Temporary password" error={errors.password} hint="At least 10 characters. Ask them to change it after the first sign-in.">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={describedBy("password", errors.password, true)}
        />
      </Field>
      <Field id="role" label="Role" hint="Editors write and publish. Admins also manage accounts.">
        <Select id="role" name="role" defaultValue="editor" aria-describedby="role-hint">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      <button type="submit" disabled={pending} className={primaryAction}>
        <UserPlus className="size-4" aria-hidden="true" />
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
