"use client";

import { submitLead } from "@/actions/lead";
import { ThankYou, withName } from "@/components/forms/thank-you";
import { Button } from "@/components/ui/button";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { readAttribution } from "@/lib/analytics/attribution";
import { track } from "@/lib/analytics/track";
import { localePath } from "@/lib/utils";
import { leadSchema } from "@/lib/validation/lead";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Values = z.input<typeof leadSchema>;

export function LeadForm({
  locale,
  copy,
  programs,
  whatsappHref,
  defaultPrograms = [],
  bare = false,
  origin = "contact",
  footer,
}: {
  locale: Locale;
  copy: Bundle["form"];
  programs: { slug: string; name: string }[];
  whatsappHref: string | null;
  defaultPrograms?: string[];
  /** Drops the card chrome and title, for use inside a dialog that has its own. */
  bare?: boolean;
  /** Which form this is, recorded on the lead: the Contact page, or the popup before WhatsApp. */
  origin?: "contact" | "whatsapp";
  footer?: ReactNode;
}) {
  const [status, setStatus] = useState<"sent" | "error" | null>(null);
  const [sentName, setSentName] = useState("");
  const [started, setStarted] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(leadSchema),
    defaultValues: { locale, name: "", whatsapp: "", programs: defaultPrograms, consent: false, website: "" },
  });

  function markStart() {
    if (started) return;
    setStarted(true);
    track({ name: "lead_form_start" });
  }

  async function onSubmit(values: Values) {
    const result = await submitLead({ ...values, locale, origin, attribution: readAttribution() });
    track({ name: "lead_form_submit", status: result.ok ? "success" : "failure" });
    if (!result.ok) {
      setStatus("error");
      return;
    }
    setSentName(values.name);
    setStatus("sent");
  }

  // The popup's visitors came for a chat, so the thank-you then opens WhatsApp for them.
  if (status === "sent") {
    return <ThankYou copy={copy} name={sentName} whatsappHref={withName(whatsappHref, copy.whatsappNameLine, sentName)} redirect={origin === "whatsapp"} />;
  }

  const error = form.formState.errors;
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={bare ? undefined : "rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-card)] md:p-7"}
      noValidate
    >
      {bare ? null : <h3 className="text-3xl font-semibold tracking-tight">{copy.title}</h3>}
      <div className={bare ? "grid gap-4" : "mt-6 grid gap-4"}>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="lead-name">
          {copy.name}
          <input
            id="lead-name"
            className="min-h-11 rounded-xl border border-line px-3 font-normal"
            autoComplete="name"
            aria-invalid={Boolean(error.name)}
            aria-describedby={error.name ? "lead-name-error" : undefined}
            {...form.register("name", { onChange: markStart })}
          />
          {error.name ? (
            <span id="lead-name-error" className="font-normal text-danger" role="alert">
              {copy.errors.name}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="lead-wa">
          {copy.whatsapp}
          <input
            id="lead-wa"
            className="min-h-11 rounded-xl border border-line px-3 font-normal"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(error.whatsapp)}
            aria-describedby={error.whatsapp ? "lead-wa-error" : undefined}
            {...form.register("whatsapp")}
          />
          {error.whatsapp ? (
            <span id="lead-wa-error" className="font-normal text-danger" role="alert">
              {copy.errors.whatsapp}
            </span>
          ) : null}
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">{copy.programs}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {programs.map((program) => (
              <label
                key={program.slug}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-3 text-base font-normal transition-colors hover:bg-logo-soft/60 has-[:checked]:border-brand has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand"
              >
                <input type="checkbox" value={program.slug} className="size-5 shrink-0 accent-accent" {...form.register("programs")} />
                {program.name}
              </label>
            ))}
          </div>
          {error.programs ? (
            <span className="mt-2 block text-sm text-danger" role="alert">
              {copy.errors.programs}
            </span>
          ) : null}
        </fieldset>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" className="mt-1 size-5 shrink-0 accent-accent" {...form.register("consent")} />
          <span>
            {copy.consent}{" "}
            <Link href={localePath(locale, "/privacy")} className="font-semibold underline">
              {"Read the policy"}
            </Link>
          </span>
        </label>
        {error.consent ? (
          <span className="text-sm text-danger" role="alert">
            {copy.errors.consent}
          </span>
        ) : null}
        <label className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
        {status === "error" ? (
          <p className="text-sm text-danger" role="alert">
            {copy.errorBody}
          </p>
        ) : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {origin === "whatsapp" && whatsappHref ? copy.submitWhatsapp : copy.submit}
        </Button>
        {footer}
      </div>
    </form>
  );
}
