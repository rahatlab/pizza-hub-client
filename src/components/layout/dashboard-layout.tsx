"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Pizza, Users, CreditCard, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { clearSession, useSession } from "@/lib/session";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: Record<string, DashboardNavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/menu", label: "My Menu", icon: Pizza },
    { href: "/dashboard/vendor/orders", label: "Orders", icon: ShoppingCart },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: CreditCard },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/menu", label: "Manage Menu", icon: Pizza },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role ?? "customer";
  const items = navItems[role] ?? navItems.customer;

  function handleLogout() {
    clearSession();
    window.location.href = "/sign-in";
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden w-64 flex-col border-r border-border bg-card shrink-0 transition-all duration-300",
          sidebarOpen ? "flex" : "hidden"
        )}
      >
        <div className="p-6">
          <Logo className="mb-8" />
          <nav className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            {user?.image ? (
              <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Pizza className="h-4 w-4" />
              </div>
            )}
            <div>
              <p className="text-body-sm font-medium">{user?.name}</p>
              <p className="text-body-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-1">
            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => window.location.href = "/dashboard/profile"}>
                  <Settings className="h-4 w-4 mr-2" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Pizza className="h-4 w-4" />
            </Button>
            <h1 className="text-h1 font-semibold">{user ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Dashboard` : "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
