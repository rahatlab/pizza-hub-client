"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      toast.success("Payment received — your Premium plan is being activated.");
    }
  }, [searchParams]);

  return (
    <div className="ph-section">
      <div className="ph-container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-tertiary-soft text-tertiary">
          <CheckCircle2 className="h-10 w-10" aria-hidden />
        </span>
        <h1 className="font-display text-4xl font-semibold text-neutral sm:text-5xl">
          Payment successful
        </h1>
        <p className="max-w-md text-sm text-muted">
          Thank you! Your vendor account is being upgraded to Premium. The change will
          appear on your dashboard shortly after Stripe confirms the payment.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
            Go to dashboard
          </Link>
          <Link href="/dashboard/upgrade" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            View plan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}