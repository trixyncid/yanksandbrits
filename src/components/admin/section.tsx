import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { panel } from "./page-header";

export function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className={cn(panel, "group")}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[0.95rem] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 text-cms-ink/60 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid gap-4 border-t border-cms-field px-5 pt-4 pb-5">{children}</div>
    </details>
  );
}
