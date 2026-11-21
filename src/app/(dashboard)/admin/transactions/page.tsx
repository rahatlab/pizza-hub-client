"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  description: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  completed: "bg-tertiary-soft text-tertiary",
  failed: "bg-primary-soft text-primary",
  refunded: "bg-sunken text-muted",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ transactions: Transaction[] }>("/api/admin/transactions")
      .then((data) => setTransactions(data.transactions))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load transactions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAuth roles={["admin"]}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-neutral">Transactions</h1>
          <p className="mt-1 text-sm text-muted">
            Vendor subscription payments processed through Stripe.
          </p>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ph-card h-16 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Vendor subscription payments will appear here."
            emoji="🧾"
          />
        ) : (
          <div className="ph-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-faint">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-sunken/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral">{t.vendorName}</p>
                      <p className="text-xs text-muted">{t.businessName}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{t.plan}</td>
                    <td className="px-4 py-3 font-semibold text-neutral">
                      {t.amount.toFixed(2)} {t.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                          STATUS_COLORS[t.status] ?? "bg-sunken text-muted",
                        )}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
