"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardTransactionsPage() {
  return (
    <RequireAuth roles={["vendor", "admin"]}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Transactions</h1>
          <p className="mt-1 text-sm text-muted">
            Subscription payments for vendors. Premium is activated only after Stripe
            confirms the payment.
          </p>
        </header>
        <EmptyState
          title="No transactions yet"
          description="Vendor subscription payments will be listed here with their Stripe status."
          emoji="🧾"
        />
      </div>
    </RequireAuth>
  );
}
