import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="ph-section">
      <div className="ph-container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <span aria-hidden className="text-7xl">🍕</span>
        <h1 className="font-display text-4xl font-semibold text-neutral sm:text-5xl">
          404 — Page not found
        </h1>
        <p className="max-w-md text-sm text-muted">
          The slice you're looking for doesn't exist. It may have been moved or
          never existed in the first place.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Back to home
        </Link>
      </div>
    </div>
  );
}