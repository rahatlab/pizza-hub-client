"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardUsersPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Users</h1>
          <p className="mt-1 text-sm text-muted">
            Every registered customer, vendor and admin on the platform.
          </p>
        </header>
        <EmptyState
          title="User directory"
          description="The full list of accounts, their roles and join dates will live here."
          emoji="👥"
        />
      </div>
    </RequireAuth>
  );
}
