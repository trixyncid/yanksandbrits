"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

function parseMetric(value: string) {
  const match = value.match(/^([^0-9-+]*)([-+]?)([\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, sign, number, suffix] = match;
  const normalized = number.replace(/,/g, "");
  const target = Number.parseFloat(normalized);
  if (!Number.isFinite(target)) return null;
  const decimals = normalized.includes(".") ? (normalized.split(".")[1]?.length ?? 0) : 0;
  return { prefix, sign, target: sign === "-" ? -target : target, suffix, decimals, commas: number.includes(",") };
}

function formatMetric(value: number, decimals: number, commas: boolean) {
  const fixed = value.toFixed(decimals);
  if (!commas) return fixed;
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const parsed = parseMetric(value);
    if (!parsed || reduce || !inView) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, parsed.target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const absolute = Math.abs(latest);
        const formatted = formatMetric(absolute, parsed.decimals, parsed.commas);
        const signed =
          parsed.target < 0 || parsed.sign === "+"
            ? `${parsed.sign || (parsed.target < 0 ? "-" : "")}${formatted}`
            : formatted;
        setDisplay(`${parsed.prefix}${signed}${parsed.suffix}`);
      },
    });

    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
