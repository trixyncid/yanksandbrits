"use client";

import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { Field, Input } from "./field";
import { useToast } from "./toast";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const toast = useToast();
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setFailed(false);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      rememberMe: form.get("remember") === "on",
    });
    if (error) {
      setPending(false);
      setFailed(true);
      toast(
        error.status === 429
          ? { tone: "error", title: "Too many attempts", text: "Wait a minute, then try again." }
          : { tone: "error", title: "Couldn’t sign you in", text: "That email and password do not match an account." },
      );
      return;
    }
    toast({ tone: "success", title: "Signed in", text: "Welcome back. Opening your dashboard." });
    router.replace(next);
    router.refresh();
  }

  // Caps Lock is the most common reason a correct password fails, so say so while typing.
  const watchCaps = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState("CapsLock"));

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <Field id="email" label="Work email">
        <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@company.com" required autoFocus aria-invalid={failed} />
      </Field>
      <Field id="password" label="Password" hint={capsLock ? undefined : "At least 10 characters."}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={10}
            onKeyDown={watchCaps}
            onKeyUp={watchCaps}
            onBlur={() => setCapsLock(false)}
            aria-invalid={failed}
            aria-describedby={capsLock ? "password-caps" : "password-hint"}
            className="pr-14"
          />
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-cms-ink/50 transition-colors hover:bg-white hover:text-cms-blue"
          >
            {reveal ? <EyeOff className="size-[1.1rem]" aria-hidden="true" /> : <Eye className="size-[1.1rem]" aria-hidden="true" />}
          </button>
        </div>
        {capsLock ? (
          <p id="password-caps" className="flex items-center gap-1.5 text-xs font-semibold text-warning" role="status">
            <CircleAlert className="size-3.5" aria-hidden="true" />
            Caps Lock is on.
          </p>
        ) : null}
      </Field>
      <label className="flex items-center gap-2.5 text-sm text-cms-ink/65">
        <input type="checkbox" name="remember" defaultChecked className="size-4 rounded border-cms-field accent-cms-blue" />
        Keep me signed in on this device
      </label>
      <button
        type="submit"
        disabled={pending}
        className="group mt-1 inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-cms-blue px-5 font-semibold text-white shadow-[0_12px_28px_rgb(37_60_161/0.3)] transition-[background-color,transform] hover:bg-cms-blue-deep active:translate-y-px disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Signing in…" : "Sign in"}
        {pending ? null : <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
      </button>
    </form>
  );
}
