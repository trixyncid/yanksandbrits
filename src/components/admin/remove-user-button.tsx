"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { removeUser } from "@/actions/cms";

export function RemoveUserButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Remove ${name}? Their articles stay, without an author.`)) return;
          startTransition(async () => {
            const result = await removeUser(id);
            setError(result.ok ? null : result.message);
          });
        }}
        className="grid size-8 place-items-center rounded-lg text-cms-ink/60 transition-colors hover:bg-danger/5 hover:text-danger disabled:opacity-50"
        aria-label={`Remove ${name}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </span>
  );
}
