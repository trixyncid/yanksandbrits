import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const controlClass =
  "w-full rounded-2xl border border-transparent bg-cms-field px-4 py-3 text-[0.95rem] text-cms-ink outline-none transition-colors placeholder:text-cms-ink/40 hover:bg-cms-gray-25/60 focus:border-cms-blue/40 focus:bg-white focus:ring-3 focus:ring-cms-blue/15 aria-[invalid=true]:border-danger/50 aria-[invalid=true]:bg-danger/5 disabled:opacity-60";

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-cms-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-cms-ink/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "resize-y leading-6", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlClass, "cursor-pointer appearance-none pr-11", className)} {...props} />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-cms-ink/60" aria-hidden="true" />
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: boolean) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}
