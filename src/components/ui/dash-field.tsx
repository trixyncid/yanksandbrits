// Scattered dash marks used as a quiet decorative accent across marketing sections.
export function DashField({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 80 80" className="size-full">
        {[
          [18, 14, 12, -28],
          [42, 10, 10, 36],
          [28, 30, 14, -12],
          [54, 28, 11, 48],
          [16, 48, 10, 22],
          [40, 52, 13, -34],
        ].map(([x, y, width, rotate]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={width} height="3" rx="1.5" fill="currentColor" transform={`rotate(${rotate} ${x} ${y})`} />
        ))}
      </svg>
    </div>
  );
}
