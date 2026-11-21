import * as React from "react";
import { cn } from "@/lib/utils";

/** Shimmer placeholder — used for menu cards, dashboard stats and tables. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-lg bg-sunken",
        className,
      )}
      {...props}
    />
  );
}
