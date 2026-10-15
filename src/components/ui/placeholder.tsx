export function Placeholder({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-md bg-accent-soft px-2 py-0.5 align-baseline text-sm font-semibold leading-6 text-accent">
      {children}
    </span>
  );
}

export function Fact({ value, missing }: { value: string | null; missing: string }) {
  if (value) return <>{value}</>;
  return <Placeholder>{missing}</Placeholder>;
}
