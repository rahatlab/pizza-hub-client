"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="ph-section">
      <div className="ph-container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <span aria-hidden className="text-7xl">⚠️</span>
        <h1 className="font-display text-4xl font-semibold text-neutral sm:text-5xl">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted">
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Try again
          </button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}