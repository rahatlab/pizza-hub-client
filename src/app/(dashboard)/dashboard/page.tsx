"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COPY = {
  customer: {
    title: "Your pizza, on the way",
    subtitle: "Browse local kitchens, order in a couple of taps and follow every step.",
  },
  vendor: {
    title: "Run your kitchen",
    subtitle: "Publish menu items, keep an eye on incoming orders and grow your shop.",
  },
  admin: {
    title: "Platform overview",
    subtitle: "Review users, approve menu items and keep an eye on every transaction.",
  },
} as const;

export default function DashboardHomePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<{ label: string; value: string }[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (upgrade === "success") toast.success("Welcome to Premium! Your plan is now active.");
    if (upgrade === "cancelled") toast.info("Checkout cancelled - you're still on the Free plan.");
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setStatsLoading(true);

    (async () => {
      try {
        if (user.role === "vendor") {
          const data = await api<{
            totalItems: number;
            activeItems: number;
            pendingItems: number;
            totalOrders: number;
            pendingOrders: number;
            deliveredOrders: number;
          }>("/api/vendor/stats");
          if (cancelled) return;
          setStats([
            { label: "Menu items", value: String(data.totalItems) },
            { label: "Active items", value: String(data.activeItems) },
            { label: "Open orders", value: String(data.pendingOrders) },
            { label: "Plan", value: user.plan === "premium" ? "Premium" : "Free" },
          ]);
        } else if (user.role === "admin") {
          const data = await api<{
            totalUsers: number;
            totalVendors: number;
            totalCustomers: number;
            totalItems: number;
            pendingItems: number;
            totalOrders: number;
            totalTransactions: number;
          }>("/api/vendor/admin/stats");
          if (cancelled) return;
          setStats([
            { label: "Registered users", value: String(data.totalUsers) },
            { label: "Vendors", value: String(data.totalVendors) },
            { label: "Customers", value: String(data.totalCustomers) },
            { label: "Menu items", value: String(data.totalItems) },
            { label: "Pending items", value: String(data.pendingItems) },
            { label: "Transactions", value: String(data.totalTransactions) },
          ]);
        } else {
          const data = await api<{ orders?: { status: string }[]; pagination?: { total: number } }>(
            "/api/orders",
          );
          const orders = (data as { orders?: { status: string }[] }).orders ?? [];
          const active = orders.filter((o) => ["placed", "accepted", "preparing", "out_for_delivery"].includes(o.status)).length;
          if (cancelled) return;
          setStats([
            { label: "Orders placed", value: String(orders.length) },
            { label: "Active orders", value: String(active) },
            { label: "Favourites", value: String(user.favoriteItemIds.length) },
          ]);
        }
      } catch {
        if (!cancelled) setStats([]);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const copy = COPY[user.role];
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            {user.role} dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-neutral sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">{copy.subtitle}</p>
        </div>

        <div className="flex gap-2">
          {user.role === "vendor" ? (
            <Link href="/dashboard/menu" className={cn(buttonVariants({ size: "sm" }))}>
              Add a menu item
            </Link>
          ) : (
            <Link href="/menu" className={cn(buttonVariants({ size: "sm" }))}>
              Browse menu
            </Link>
          )}
          <Link
            href="/profile"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit profile
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: user?.role === "admin" ? 6 : 4 }).map((_, i) => (
              <div key={i} className="ph-card animate-pulse p-5">
                <div className="h-3 w-20 rounded bg-sunken" />
                <div className="mt-3 h-8 w-12 rounded bg-sunken" />
              </div>
            ))
          : stats.map((stat) => (
              <div key={stat.label} className="ph-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-faint">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-neutral">{stat.value}</p>
              </div>
            ))}
      </section>

      <section className="ph-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral">
              Welcome, {firstName}
            </h2>
            <p className="text-sm text-muted">
              {user.role === "vendor" && user.businessName
                ? `${user.businessName} · ${user.businessLocation || "location not set"}`
                : "Your account is ready."}
            </p>
          </div>
          <Badge tone={user.role === "admin" ? "primary" : "secondary"}>{user.role}</Badge>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-sunken/50 p-4">
            <h3 className="text-sm font-semibold text-neutral">Next steps</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {user.role === "vendor" ? (
                <>
                  <li>• Publish your first menu item (free plan allows 3 active).</li>
                  <li>• Add shop details so customers can find you.</li>
                  <li>• Upgrade to Premium for unlimited items.</li>
                </>
              ) : user.role === "admin" ? (
                <>
                  <li>• Approve or reject pending menu items.</li>
                  <li>• Review registered vendors and customers.</li>
                  <li>• Check subscription transactions.</li>
                </>
              ) : (
                <>
                  <li>• Browse the menu and place your first order.</li>
                  <li>• Save favourites for one-tap reordering.</li>
                  <li>• Track delivery on the order timeline.</li>
                </>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-sunken/50 p-4">
            <h3 className="text-sm font-semibold text-neutral">Account</h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Email</dt>
                <dd className="truncate font-medium text-neutral">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Member since</dt>
                <dd className="font-medium text-neutral">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Plan</dt>
                <dd className="font-medium text-neutral">{user.plan}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
