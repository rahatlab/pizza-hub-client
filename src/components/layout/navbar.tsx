"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
];

/**
 * Site chrome. The auth-dependent half will be gated behind a mounted
 * session check so the server render and the first client paint stay
 * identical — no hydration mismatch when a session cookie exists.
 */
export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="ph-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="PizzaHub home">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-lg leading-none text-white"
          >
            🍕
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-neutral">
            PizzaHub
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-sunken text-neutral"
                  : "text-muted hover:text-neutral",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                  loading && "pointer-events-none opacity-0",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden sm:inline-flex",
                  loading && "pointer-events-none opacity-0",
                )}
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-raised text-neutral md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-surface md:hidden" aria-label="Mobile">
          <div className="ph-container flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral hover:bg-sunken"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2 border-t border-line pt-3">
                <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
                  Sign in
                </Link>
                <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "flex-1")}>
                  Get started
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
