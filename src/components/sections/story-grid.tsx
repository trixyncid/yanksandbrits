"use client";

import { Flag } from "@/components/sections/story-parts";
import type { Story } from "@/lib/stories/schema";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Quote, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/** Program filter chips and the story cards. Chips only appear when stories span more than one program. */
export function StoryGrid({ stories, hrefFor }: { stories: Story[]; hrefFor: Record<string, string> }) {
  const programs = [...new Map(stories.flatMap((story) => (story.program ? [[story.program.slug, story.program.name] as const] : []))).entries()];
  const [filter, setFilter] = useState<string | null>(null);
  const visible = filter ? stories.filter((story) => story.program?.slug === filter) : stories;
  const chips = [{ slug: null, name: "All stories", count: stories.length }, ...programs.map(([slug, name]) => ({ slug, name, count: stories.filter((story) => story.program?.slug === slug).length }))];

  return (
    <>
      {programs.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter stories by program">
          {chips.map((chip) => {
            const active = filter === chip.slug;
            return (
              <button
                key={chip.slug ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(chip.slug)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                  active ? "bg-brand text-white" : "border border-line bg-white text-ink hover:border-brand hover:text-brand",
                )}
              >
                {chip.name}
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/20" : "bg-logo-soft text-muted")}>{chip.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visible.map((story) => (
          <li key={story.slug}>
            <article className="interactive-lift group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_44px_rgb(11_16_32/0.08)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-accent-soft">
                {story.photo ? (
                  <Image src={story.photo} alt={story.photoAlt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                ) : (
                  <span className="grid size-full place-items-center text-brand/40" aria-hidden="true">
                    <UserRound className="size-14" />
                  </span>
                )}
                {story.scoreGain ? (
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand shadow-sm tabular-nums">
                    {story.scoreGain} {story.program?.name ?? ""}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <Quote className="size-5 text-brand/30" aria-hidden="true" />
                <p className="mt-2 line-clamp-3 font-display text-lg leading-snug text-ink">{story.headline}</p>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold tracking-tight">
                      {/* The whole card is the link. */}
                      <Link href={hrefFor[story.slug]} className="after:absolute after:inset-0">
                        {story.studentName}
                      </Link>
                    </h3>
                    {story.destination || story.country ? (
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
                        <Flag code={story.countryCode} />
                        <span className="truncate">{story.destination || story.country}</span>
                      </p>
                    ) : null}
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white" aria-hidden="true">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
