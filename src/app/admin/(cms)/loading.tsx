export default function Loading() {
  const block = "rounded-[1.75rem] bg-white/80";
  return (
    <div className="mx-auto max-w-[100rem] animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-48 max-w-full rounded-xl bg-white/80" />
      <div className="mt-2.5 h-4 w-80 max-w-full rounded-full bg-white/70" />
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className={`h-52 ${block}`} />
            ))}
          </div>
          <div className={`h-[22rem] ${block}`} />
        </div>
        <div className="grid content-start gap-6">
          <div className="h-[24rem] rounded-[1.75rem] bg-cms-navy/15" />
          <div className={`h-56 ${block}`} />
        </div>
      </div>
    </div>
  );
}
