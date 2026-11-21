"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardOrdersPage() {
  return (
    <RequireAuth roles={["vendor", "admin"]}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Customer orders</h1>
          <p className="mt-1 text-sm text-muted">
            Accept, prepare and deliver incoming orders — every status change is logged
            with who made it.
          </p>
        </header>
        <EmptyState
          title="No orders yet"
          description="Incoming orders will appear here the moment a customer checks out."
          actionHref="/dashboard/menu"
          actionLabel="Manage menu"
        />
      </div>
    </RequireAuth>
  );
}
