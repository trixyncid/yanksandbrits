import type { ArticleState } from "@/lib/cms/status";
import { cn } from "@/lib/utils";

const styles: Record<ArticleState, string> = {
  draft: "bg-cms-gray-25 text-cms-ink/65",
  published: "bg-cms-blue-10 text-cms-blue",
  scheduled: "bg-white text-cms-blue ring-1 ring-inset ring-cms-blue-20",
};

const labels: Record<ArticleState, string> = { draft: "Draft", published: "Published", scheduled: "Scheduled" };

export function StatusBadge({ state, className }: { state: ArticleState; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[state], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[state]}
    </span>
  );
}
