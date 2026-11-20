"use client";

import { Clock, CheckCircle2, X, Loader2 } from "lucide-react";

type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";

type TimelineStep = {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
};

const STEPS: TimelineStep[] = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "accepted", label: "Accepted", icon: CheckCircle2 },
  { status: "rejected", label: "Rejected", icon: X },
  { status: "cancelled", label: "Cancelled", icon: X },
];

interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = STEPS.findIndex((s) => s.status === status);
  const isTerminal = ["accepted", "rejected", "cancelled"].includes(status);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-muted" />

        {STEPS.map((step, i) => {
          const isActive = i <= currentIndex && !isTerminal;
          const isCompleted = i < currentIndex || (isTerminal && i === currentIndex);
          const isCurrent = i === currentIndex && !isTerminal;

          return (
            <div key={step.status} className="relative pl-12 pt-6 pb-4">
              {/* Step marker */}
              <div className="absolute left-0 top-4 flex w-6 h-6 items-center justify-center rounded-full border-2 transition-colors">
                {isCompleted ? (
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-muted" />
                )}
              </div>

              {/* Step content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-medium transition-colors ${
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </div>
                  {isCompleted && step.status !== "pending" && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      Done
                    </span>
                  )}
                </div>
                <div className="h-px bg-muted" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status summary */}
      <div className="mt-8 p-4 rounded-xl border border-border bg-muted/50 text-center">
        <div className={`flex items-center justify-center gap-2 mb-2 ${
          status === "accepted"
            ? "text-emerald-600 dark:text-emerald-400"
            : status === "rejected" || status === "cancelled"
            ? "text-destructive"
            : "text-primary"
        }`}>
          {status === "accepted" && <CheckCircle2 className="h-5 w-5" />}
          {(status === "rejected" || status === "cancelled") && <X className="h-5 w-5" />}
          {status === "pending" && <Clock className="h-5 w-5 animate-pulse" />}
        </div>
        <p className="text-sm font-medium capitalize">{status}</p>
      </div>
    </div>
  );
}
