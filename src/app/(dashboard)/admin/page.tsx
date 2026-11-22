"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Package, ShieldCheck, ShoppingBag, Store, Users, Wallet } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalItems: number;
  pendingItems: number;
  totalOrders: number;
  totalTransactions: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Stats>("/api/vendor/admin/stats")
      .then(setStats)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load stats"))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total users", value: stats.totalUsers, icon: Users, href: "/admin/users" },
        { label: "Vendors", value: stats.totalVendors, icon: Store, href: "/admin/users?role=vendor" },
        { label: "Customers", value: stats.totalCustomers, icon: Users, href: "/admin/users?role=customer" },
        { label: "Menu items", value: stats.totalItems, icon: ShoppingBag, href: "/admin/menu" },
        { label: "Pending approval", value: stats.pendingItems, icon: ShieldCheck, href: "/admin/menu?status=pending" },
        { label: "Orders", value: stats.totalOrders, icon: Package, href: "/orders" },
        { label: "Transactions", value: stats.totalTransactions, icon: Wallet, href: "/admin/transactions" },
      ]
    : [];

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
            Review users, approve menu items and audit every vendor subscription.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="ph-card h-24 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="ph-card p-5 transition-shadow hover:shadow-lifted"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-faint">
                      {card.label}
                    </p>
                    <Icon className="h-4 w-4 text-muted" aria-hidden />
                  </div>
                  <p className="mt-2 font-display text-3xl font-semibold text-neutral">
                    {card.value}
                  </p>
                </Link>
              );
            })}
          </section>
        )}

        <section className="ph-card p-5">
          <h2 className="font-display text-xl font-semibold text-neutral">Moderation queue</h2>
          <p className="mt-1 text-sm text-muted">
            Menu items submitted by vendors wait here until you approve or reject them.
          </p>
          <Link
            href="/admin/menu?status=pending"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Review pending items
          </Link>
        </section>

        <section className="ph-card p-5">
          <h2 className="font-display text-xl font-semibold text-neutral">Quick links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Manage users
            </Link>
            <Link href="/admin/menu" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Moderate menu
            </Link>
            <Link href="/admin/transactions" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              View transactions
            </Link>
            <Link href="/orders" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              All orders
            </Link>
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
