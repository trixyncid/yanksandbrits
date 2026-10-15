"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Rounds up to 1, 2, 2.5 or 5 times a power of ten, so the top tick is a friendly number. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((multiple) => multiple * power >= value) ?? 10;
  return step * power;
}

/**
 * Edits per period as track-and-fill bars. One series, so one hue: the logo blue.
 * Rests on the busiest period; hover, or focus the chart and use the arrow keys, to read others.
 */
export function ActivityChart({ columns, labels, ticks }: { columns: number[]; labels: string[]; ticks: string[] }) {
  const peak = columns.reduce((best, value, index) => (value > columns[best] ? index : best), columns.length - 1);
  const [active, setActive] = useState<number | null>(null);
  const shown = active ?? peak;
  const top = niceMax(Math.max(...columns));
  const axis = [top, top / 2, 0];

  const move = (step: number) => setActive((current) => Math.min(columns.length - 1, Math.max(0, (current ?? peak) + step)));

  return (
    <div className="mt-6 flex gap-3">
      {/* Recessive axis: muted ticks, no gridlines; the tracks already give the scale. */}
      <ol className="flex h-60 flex-col justify-between text-right text-xs leading-none text-cms-ink/45 tabular-nums" aria-hidden="true">
        {axis.map((tick) => (
          <li key={tick}>
            {Number.isInteger(tick) ? tick : tick.toFixed(1)}
          </li>
        ))}
      </ol>

      <div className="min-w-0 flex-1">
        <div
          className="grid h-60 items-end gap-1.5 rounded-xl outline-offset-4 sm:gap-2.5"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          tabIndex={0}
          role="group"
          aria-label="Edits per period. Use the left and right arrow keys to read each one."
          onMouseLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") move(1);
            else if (event.key === "ArrowLeft") move(-1);
            else return;
            event.preventDefault();
          }}
        >
          {columns.map((value, index) => {
            const height = value === 0 ? 0 : Math.max(4, (value / top) * 100);
            const on = index === shown;
            // Keep the tooltip inside the chart at both ends.
            const align = index < 2 ? "left-0" : index > columns.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              // The whole column is the hover target, not just the filled part.
              <div key={index} className="relative h-full" onMouseEnter={() => setActive(index)}>
                <div className="absolute inset-x-0 bottom-0 mx-auto h-full max-w-10 rounded-full bg-cms-field">
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 rounded-full transition-[height,background-color] duration-500",
                      on ? "bg-cms-navy" : active === null ? "bg-cms-blue" : "bg-cms-blue/45",
                    )}
                    style={{ height: `${height}%` }}
                  >
                    {on && value > 0 ? (
                      <>
                        <span className="absolute inset-x-0 top-3 bottom-3 mx-auto w-0 border-l-2 border-dashed border-white/60" aria-hidden="true" />
                        <span className="absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-white ring-[3px] ring-cms-navy" aria-hidden="true" />
                      </>
                    ) : null}
                  </div>
                </div>
                {on ? (
                  <div
                    className={cn("pointer-events-none absolute z-10 w-max rounded-xl bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgb(13_21_56/0.16)] ring-1 ring-cms-gray-25", align)}
                    style={{ bottom: `calc(${Math.min(height, 82)}% + 1rem)` }}
                    aria-live="polite"
                  >
                    <p className="text-xs text-cms-ink/55">{labels[index]}</p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums">
                      {value} edit{value === 1 ? "" : "s"}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <ol className="mt-3 grid gap-1.5 text-center text-xs text-cms-ink/50 sm:gap-2.5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }} aria-hidden="true">
          {ticks.map((tick, index) => (
            <li key={index} className={cn("truncate", index === shown && "font-semibold text-cms-ink", columns.length > 8 && index % 2 === 1 && "max-md:invisible")}>
              {tick}
            </li>
          ))}
        </ol>

        {/* The same numbers as text, for screen readers. */}
        <ul className="sr-only">
          {columns.map((value, index) => (
            <li key={index}>
              {labels[index]}: {value} edit{value === 1 ? "" : "s"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
