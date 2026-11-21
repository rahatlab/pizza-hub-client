"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, type Role } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side guard for every private route.
 *
 * The JWT lives in localStorage, so a reload starts with `loading` true and
 * the stored token is verified against /api/account/me before anything is
 * rendered — a private page never flashes the sign-in screen on refresh.
 */
export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/sign-in?next=${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="ph-container flex flex-col gap-4 py-16">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="ph-container py-24 text-center">
        <p className="font-display text-3xl font-semibold text-neutral">403 — Forbidden</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Your account does not have access to this area.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
