import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold tracking-[0.16em] text-cms-blue uppercase">{eyebrow}</p> : null}
        <h1 className="mt-2 text-[clamp(1.75rem,1.3rem+1.1vw,2.35rem)] leading-[1.05] font-bold tracking-[-0.035em]">{title}</h1>
        {description ? <p className="mt-2 max-w-[62ch] text-sm leading-6 text-cms-ink/65">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export const primaryAction =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cms-blue px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgb(37_60_161/0.25)] transition-colors hover:bg-cms-blue-deep disabled:opacity-60 disabled:shadow-none";

export const secondaryAction =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-cms-ink ring-1 ring-cms-gray-25 transition-colors hover:text-cms-blue hover:ring-cms-blue/30 disabled:opacity-60";

// Same surface as the dashboard cards: white, with a soft ink-tinted lift off the canvas.
export const panel = "rounded-[1.75rem] bg-white shadow-[0_1px_2px_rgb(13_21_56/0.04),0_12px_32px_-12px_rgb(13_21_56/0.08)]";
