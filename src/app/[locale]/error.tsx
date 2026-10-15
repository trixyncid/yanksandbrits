"use client";

import { getBundle } from "@/lib/content";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const copy = getBundle("en");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20">
      <h1 className="text-4xl tracking-tight">{copy.error.title}</h1>
      <p className="mt-4 leading-7 text-muted">{copy.error.body}</p>
      <button type="button" className="mt-6 min-h-11 rounded-full bg-accent px-5 font-semibold text-white" onClick={reset}>
        {copy.error.retry}
      </button>
    </div>
  );
}
