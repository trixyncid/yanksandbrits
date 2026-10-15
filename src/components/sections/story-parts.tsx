import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

/** The flag emoji for an ISO alpha-2 code, built from regional indicator letters. */
export function Flag({ code, className }: { code: string | null; className?: string }) {
  if (!code) return null;
  const emoji = String.fromCodePoint(...[...code.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
  return (
    <span className={cn("leading-none", className)} aria-hidden="true">
      {emoji}
    </span>
  );
}

const asNumber = (value: string) => Number(value.replace(",", "."));

/**
 * Before and after as two bars on the same scale, so the jump reads at a glance.
 * Falls back to plain "5.5 → 7.0" when the scores are not numbers (e.g. "HSK 3 → HSK 5").
 */
export function ScoreJourney({ label, before, after, gain, tone = "light" }: { label: string; before: string; after: string; gain: string | null; tone?: "light" | "dark" }) {
  if (!before) return null;
  const from = asNumber(before);
  const to = asNumber(after);
  const numeric = after && Number.isFinite(from) && Number.isFinite(to) && to > 0;
  const dark = tone === "dark";
  const summary = `${label ? `${label}: ` : ""}${before}${after ? ` to ${after}` : ""}${gain ? `, ${gain}` : ""}`;

  return (
    <figure aria-label={summary}>
      <figcaption className={cn("flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.14em] uppercase", dark ? "text-white/60" : "text-logo")}>
        <span>{label || "Score"}</span>
        {gain ? <span className={cn("rounded-full px-2.5 py-1 text-[0.7rem] tracking-normal normal-case tabular-nums", dark ? "bg-white text-brand" : "bg-brand text-white")}>{gain}</span> : null}
      </figcaption>
      {numeric ? (
        <div className="mt-3 grid gap-2" aria-hidden="true">
          {[
            { name: "Before", value: before, width: Math.max(8, Math.min(100, (from / Math.max(from, to)) * 100)), strong: false },
            { name: "After", value: after, width: 100, strong: true },
          ].map((row) => (
            <div key={row.name} className="grid grid-cols-[3.5rem_1fr_3rem] items-center gap-3">
              <span className={cn("text-xs", dark ? "text-white/60" : "text-muted")}>{row.name}</span>
              <span className={cn("h-2.5 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-logo-soft")}>
                <span className={cn("block h-full rounded-full", row.strong ? (dark ? "bg-white" : "bg-brand") : dark ? "bg-white/45" : "bg-logo")} style={{ width: `${row.width}%` }} />
              </span>
              <span className={cn("text-right text-base font-semibold tabular-nums", dark ? "text-white" : "text-ink")}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className={cn("mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums", dark ? "text-white" : "text-ink")}>
          {before}
          {after ? (
            <>
              <ArrowRight className="size-5 opacity-50" aria-hidden="true" />
              {after}
            </>
          ) : null}
        </p>
      )}
    </figure>
  );
}
