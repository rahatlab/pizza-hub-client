"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, Loader2, MapPin, Package } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";

interface OrderItem {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  image: string;
  lineTotal: number;
}

interface TimelineEntry {
  id: string;
  status: string;
  actorName: string;
  actorRole: string;
  note: string;
  at: string;
}

interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryDate: string;
  address: string;
  phone: string;
  instructions: string;
  status: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-secondary-soft text-secondary-strong",
  accepted: "bg-primary-soft text-primary",
  preparing: "bg-gold/15 text-gold",
  out_for_delivery: "bg-tertiary-soft text-tertiary",
  delivered: "bg-tertiary-soft text-tertiary",
  cancelled: "bg-sunken text-muted",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "10");
      const data = await api<{ orders: Order[]; pagination: { totalPages: number } }>(
        `/api/orders?${params.toString()}`,
      );
      setOrders(data.orders);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter, page]);

  if (!user) return null;

  const isVendor = user.role === "vendor";

  return (
    <RequireAuth>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-neutral">
              {isVendor ? "Customer orders" : "My orders"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isVendor
                ? "Accept, prepare and deliver incoming orders."
                : "Track every order from the oven to your door."}
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="h-10 rounded-full border border-line bg-raised px-4 text-sm text-neutral outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ph-card h-32 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : error ? (
          <div className="ph-card p-8 text-center">
            <p className="text-sm text-muted">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title={isVendor ? "No orders yet" : "No orders placed"}
            description={
              isVendor
                ? "Incoming orders will appear here the moment a customer checks out."
                : "Browse the menu and place your first order."
            }
            actionHref={isVendor ? "/dashboard/menu" : "/menu"}
            actionLabel={isVendor ? "Manage menu" : "Browse menu"}
            emoji="📦"
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="ph-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lifted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-lg">
                      🍕
                    </span>
                    <div>
                      <p className="font-semibold text-neutral">
                        {order.items.map((i) => i.itemName).join(", ")}
                      </p>
                      <p className="text-xs text-muted">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item
                        {order.items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""}{" "}
                        · {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_COLORS[order.status] ?? "bg-sunken text-muted",
                      )}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-9 items-center rounded-full border border-line bg-raised px-4 text-sm font-medium text-neutral transition-colors hover:bg-sunken disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-9 items-center rounded-full border border-line bg-raised px-4 text-sm font-medium text-neutral transition-colors hover:bg-sunken disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        )}
      </div>
    </RequireAuth>
  );
}
