"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/require-auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            Admin dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-neutral">
            Platform overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Approve menu items, manage accounts and audit every vendor subscription.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Users", value: "1", href: "/dashboard/users" },
            { label: "Menu items", value: "0", href: "/dashboard/menu" },
            { label: "Transactions", value: "0", href: "/dashboard/transactions" },
          ].map((card) => (
            <Link key={card.label} href={card.href} className="ph-card p-5 transition-shadow hover:shadow-lifted">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-neutral">{card.value}</p>
            </Link>
          ))}
        </section>

        <section className="ph-card p-5">
          <h2 className="font-display text-xl font-semibold text-neutral">Moderation queue</h2>
          <p className="mt-1 text-sm text-muted">
            Menu items submitted by vendors wait here until you approve or reject them.
          </p>
          <Link
            href="/dashboard/menu"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Review menu items
          </Link>
        </section>
      </div>
    </RequireAuth>
  );
}
