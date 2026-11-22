"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PaymentCancelPage() {
  return (
    <div className="ph-section">
      <div className="ph-container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-primary">
          <XCircle className="h-10 w-10" aria-hidden />
        </span>
        <h1 className="font-display text-4xl font-semibold text-neutral sm:text-5xl">
          Payment cancelled
        </h1>
        <p className="max-w-md text-sm text-muted">
          No charges were made. You can try again whenever you're ready.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/upgrade" className={cn(buttonVariants({ size: "lg" }))}>
            Try again
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}