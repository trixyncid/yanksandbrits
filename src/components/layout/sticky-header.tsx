"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Tone = "light" | "dark";

/** The first opaque background under a point, ignoring the header itself. */
function toneBehind(header: HTMLElement): Tone {
  const y = header.offsetHeight / 2;
  const hit = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !header.contains(el));
  for (let el: Element | null = hit ?? null; el; el = el.parentElement) {
    // Only plain rgb() is read; color-mix() results come back in other spaces and are skipped.
    const match = getComputedStyle(el).backgroundColor.match(/^rgba?\((.+)\)$/)?.[1].match(/[\d.]+/g);
    if (!match) continue;
    const [r, g, b, a = 1] = match.map(Number);
    if (a < 0.5) continue;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140 ? "dark" : "light";
  }
  return "light";
}

export function StickyHeader({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<Tone>("light");

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 12);
      if (ref.current) setTone(toneBehind(ref.current));
    };
    // Wait a frame so a new route's hero is painted before we sample it.
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <header
      ref={ref}
      data-tone={scrolled ? "light" : tone}
      className={cn(
        // Negative margin lets the page's first section run underneath; globals.css pads its content back down.
        "group/header sticky top-0 z-[var(--z-header)] -mb-[calc(var(--header-h)+1px)] border-b text-ink transition-[border-color,box-shadow,background-color] duration-300",
        scrolled ? "border-line/80 bg-white/92 shadow-[0_10px_30px_rgb(42_45_52/0.08)] backdrop-blur-md" : "border-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </header>
  );
}
