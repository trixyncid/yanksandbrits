"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RangePicker({ value, options }: { value: number; options: readonly number[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Period</span>
      <select
        value={value}
        onChange={(event) => startTransition(() => router.push(`/admin?range=${event.target.value}`, { scroll: false }))}
        className="h-10 cursor-pointer appearance-none rounded-xl bg-white pr-10 pl-4 text-sm font-medium text-cms-ink/75 ring-1 ring-cms-gray-25 outline-none hover:ring-cms-blue/30 focus:ring-3 focus:ring-cms-blue/25 aria-busy:opacity-60"
        aria-busy={pending}
      >
        {options.map((days) => (
          <option key={days} value={days}>
            Last {days} days
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-cms-ink/55" aria-hidden="true" />
    </label>
  );
}
