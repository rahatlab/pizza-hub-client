"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  vendor: { id: string; name: string; businessName: string };
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export default function AdminMenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api<{ items: Item[] }>(`/api/admin/menu${params}`);
      setItems(data.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  async function moderate(id: string, status: "approved" | "rejected") {
    setActing(id);
    try {
      await api(`/api/menu/${id}/moderate`, { method: "PATCH", body: { status } });
      toast.success(`Item ${status}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update item");
    } finally {
      setActing(null);
    }
  }

  return (
    <RequireAuth roles={["admin"]}>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-neutral">Menu moderation</h1>
            <p className="mt-1 text-sm text-muted">
              Review items submitted by vendors before they go live.
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="h-10 rounded-full border border-line bg-raised px-4 text-sm text-neutral outline-none focus:border-primary"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ph-card h-24 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing to review"
            description="No items match this filter."
            emoji="✅"
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="ph-card flex flex-col gap-4 p-5 sm:flex-row">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sunken">
                  {item.images?.[0] ? (
                    <Image src={item.images[0]} alt={item.itemName} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl">🍕</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral">{item.itemName}</h3>
                    <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold uppercase text-muted">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {item.category} · ${item.price.toFixed(2)} · {item.location}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    by {item.vendor.businessName || item.vendor.name}
                  </p>
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{item.description}</p>
                  )}
                </div>
                {item.status === "pending" && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "approved")}
                      disabled={acting === item.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-tertiary px-4 text-xs font-semibold text-white transition-colors hover:bg-tertiary-strong disabled:opacity-60"
                    >
                      {acting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "rejected")}
                      disabled={acting === item.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}
