"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, Store, UserRound } from "lucide-react";
import { homeFor, useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

/** Avatar + dropdown shown in the navbar once a session exists. */
export function UserMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
      setOpen(false);
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-raised py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong"
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-sunken text-xs font-bold text-neutral">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || "🍕"
          )}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-neutral sm:block">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-xl border border-line bg-raised shadow-lifted"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-neutral">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {user.role === "admin" ? (
                <ShieldCheck className="h-3 w-3" aria-hidden />
              ) : user.role === "vendor" ? (
                <Store className="h-3 w-3" aria-hidden />
              ) : (
                <UserRound className="h-3 w-3" aria-hidden />
              )}
              {user.role}
            </span>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push(homeFor(user.role));
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral hover:bg-sunken"
            >
              <LayoutDashboard className="h-4 w-4 text-muted" aria-hidden />
              Dashboard
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral hover:bg-sunken"
            >
              <UserRound className="h-4 w-4 text-muted" aria-hidden />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              disabled={busy}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}