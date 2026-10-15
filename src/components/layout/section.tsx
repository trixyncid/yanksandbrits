import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  id,
  children,
  muted = false,
  className,
}: {
  id?: string;
  children: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={cn(muted ? "bg-white" : "bg-transparent", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold tracking-wide text-accent">{children}</p>;
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("mt-3 max-w-[18ch] text-[clamp(2rem,1.1rem+1.6vw,3.15rem)] leading-[1.08] font-semibold tracking-tight", className)}>
      {children}
    </h2>
  );
}
