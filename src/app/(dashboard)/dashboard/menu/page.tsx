"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardMenuPage() {
  return (
    <RequireAuth roles={["vendor", "admin"]}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Menu items</h1>
          <p className="mt-1 text-sm text-muted">
            Free plan keeps up to 3 items active at a time; Premium removes the limit.
          </p>
        </header>
        <EmptyState
          title="Your menu is empty"
          description="Publish your first pizza, side or drink and it will show up on the public menu."
          emoji="🧑‍🍳"
        />
      </div>
    </RequireAuth>
  );
}
