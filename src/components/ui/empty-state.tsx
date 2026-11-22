import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Placeholder used by dashboard sections until their data layer lands. */
export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  emoji = "🍕",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  emoji?: string;
}) {
  return (
    <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span aria-hidden className="text-4xl">
        {emoji}
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold text-neutral">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && (onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={cn(buttonVariants({ size: "sm" }), "mt-6")}
        >
          {actionLabel}
        </button>
      ) : actionHref ? (
        <Link href={actionHref} className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
          {actionLabel}
        </Link>
      ) : null)}
    </div>
  );
}
