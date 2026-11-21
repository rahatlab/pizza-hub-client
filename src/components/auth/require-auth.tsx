"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const denied = !loading && user && roles && !roles.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams}` : ""));
      router.replace(`/sign-in?next=${next}`);
    }
  }, [loading, user, pathname, searchParams, router]);

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

  if (denied) {
    return (
      <div className="ph-container py-24 text-center">
        <p className="font-display text-3xl font-semibold text-neutral">403 — Forbidden</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Your account does not have access to this area.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong"
        >
          Back to your dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
