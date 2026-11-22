"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UpgradePage() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const data = await api<{ url: string }>("/api/stripe/checkout", { method: "POST" });
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <RequireAuth roles={["vendor"]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Upgrade to Premium</h1>
          <p className="mt-1 text-sm text-muted">
            Unlock unlimited menu items and priority placement.
          </p>
        </header>

        <div className="ph-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-strong p-6 text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wide">Premium plan</span>
            </div>
            <p className="mt-3 font-display text-4xl font-semibold">$9.99</p>
            <p className="text-sm opacity-90">per month · billed monthly</p>
          </div>

          <div className="p-6">
            <ul className="space-y-3 text-sm text-neutral">
              {[
                "Unlimited active menu items (free plan: 3)",
                "Priority placement in search results",
                "Advanced analytics (coming soon)",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-tertiary-soft text-tertiary">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {user.plan === "premium" ? (
                <div className="rounded-xl border border-tertiary/30 bg-tertiary-soft p-4 text-center">
                  <p className="font-semibold text-tertiary">You're on Premium!</p>
                  <p className="mt-1 text-sm text-muted">
                    Your plan is active until{" "}
                    {user.premiumUntil
                      ? new Date(user.premiumUntil).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {loading ? "Redirecting to checkout…" : "Upgrade to Premium"}
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-faint">
              Powered by Stripe · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
