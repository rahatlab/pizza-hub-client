"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CircleUserRound,
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useAuth, type Role } from "@/components/auth/auth-provider";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["admin", "vendor", "customer"] },
  { href: "/dashboard/orders", label: "Customer Orders", icon: ShoppingBag, roles: ["vendor", "admin"] },
  { href: "/dashboard/menu", label: "Menu Items", icon: MenuIcon, roles: ["vendor", "admin"] },
  { href: "/dashboard/transactions", label: "Transactions", icon: Wallet, roles: ["vendor", "admin"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/profile", label: "Profile", icon: CircleUserRound, roles: ["admin", "vendor", "customer"] },
];

/**
 * Sidebar chrome for every signed-in area. The links a role cannot use are
 * never rendered — and the API rejects them server-side anyway.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const sidebar = (
    <div className="flex h-full flex-col gap-6">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-lg text-white"
        >
          🍕
        </span>
        <span className="font-display text-lg font-semibold text-neutral">PizzaHub</span>
      </Link>

      <div className="px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
          {user.role === "vendor" ? user.businessName || "Your kitchen" : `${user.role} space`}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-sunken hover:text-neutral",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-line bg-sunken/60 p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral">
          <Store className="h-3.5 w-3.5 text-muted" aria-hidden />
          {user.plan === "premium" ? "Premium plan" : "Free plan"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {user.role === "vendor"
            ? user.plan === "premium"
              ? "Unlimited menu items."
              : "Up to 3 active menu items."
            : "Browse, order and track deliveries."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-sunken/40">
      <div className="mx-auto flex w-full max-w-[88rem]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface p-4 lg:block">
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-raised text-neutral lg:hidden"
                aria-label="Open menu"
                aria-expanded={open}
              >
                <MenuIcon className="h-5 w-5" aria-hidden />
              </button>
              <div>
                <p className="text-xs text-faint">Signed in as</p>
                <p className="text-sm font-semibold text-neutral">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-line bg-surface p-4">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-raised text-neutral"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
