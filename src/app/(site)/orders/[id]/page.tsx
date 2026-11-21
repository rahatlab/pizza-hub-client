"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Loader2, MapPin, Package } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
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

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-secondary-soft text-secondary-strong",
  accepted: "bg-primary-soft text-primary",
  preparing: "bg-gold/15 text-gold",
  out_for_delivery: "bg-tertiary-soft text-tertiary",
  delivered: "bg-tertiary-soft text-tertiary",
  cancelled: "bg-sunken text-muted",
};

const VENDOR_ACTIONS: { status: string; label: string }[] = [
  { status: "accepted", label: "Accept order" },
  { status: "preparing", label: "Start preparing" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Mark delivered" },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api<Order>(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function updateStatus(status: string) {
    if (!id) return;
    setUpdating(true);
    try {
      const data = await api<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: { status, note },
      });
      setOrder(data);
      setNote("");
      toast.success(`Order ${status.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the order");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="ph-section">
        <div className="ph-container space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-sunken" />
          <div className="h-40 animate-pulse rounded-xl bg-sunken" />
          <div className="h-64 animate-pulse rounded-xl bg-sunken" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="ph-section">
        <div className="ph-container">
          <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span aria-hidden className="text-4xl">
              📦
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-neutral">
              Order not found
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {error ?? "This order may have been removed."}
            </p>
            <Link href="/orders" className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVendor = user?.role === "vendor" && user.id === order.vendorId;
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer" && user.id === order.customerId;
  const canUpdate = isVendor || isAdmin;

  // Vendor actions based on current status
  const nextActions = VENDOR_ACTIONS.filter((action) => {
    const transitions: Record<string, string[]> = {
      placed: ["accepted", "cancelled"],
      accepted: ["preparing", "cancelled"],
      preparing: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
    };
    return transitions[order.status]?.includes(action.status);
  });

  const canCancel = isCustomer && ["placed", "accepted"].includes(order.status);

  return (
    <div className="ph-section">
      <div className="ph-container space-y-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-neutral"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to orders
        </Link>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-neutral">
              {STATUS_LABELS[order.status] ?? order.status}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              STATUS_COLORS[order.status] ?? "bg-sunken text-muted",
            )}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: items + delivery */}
          <div className="space-y-6">
            <section className="ph-card p-5">
              <h2 className="font-display text-xl font-semibold text-neutral">Items</h2>
              <ul className="mt-3 divide-y divide-line">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sunken">
                      {item.image ? (
                        <img src={item.image} alt={item.itemName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-lg">🍕</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral">{item.itemName}</p>
                      <p className="text-xs text-muted">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral">{formatPrice(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery fee</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-neutral">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="ph-card p-5">
              <h2 className="font-display text-xl font-semibold text-neutral">Delivery</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted">Date</dt>
                  <dd className="text-neutral">
                    {new Date(order.deliveryDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted">Address</dt>
                  <dd className="text-neutral">{order.address}</dd>
                </div>
                {order.phone && (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">Phone</dt>
                    <dd className="text-neutral">{order.phone}</dd>
                  </div>
                )}
                {order.instructions && (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">Notes</dt>
                    <dd className="text-neutral">{order.instructions}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Vendor/admin actions */}
            {(canUpdate || canCancel) && (
              <section className="ph-card p-5">
                <h2 className="font-display text-xl font-semibold text-neutral">Update status</h2>
                <div className="mt-3 space-y-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note for the customer"
                    rows={2}
                    className="w-full rounded-xl border border-line bg-raised px-3.5 py-2.5 text-sm text-neutral outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <div className="flex flex-wrap gap-2">
                    {canUpdate &&
                      nextActions.map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          onClick={() => updateStatus(action.status)}
                          disabled={updating}
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:opacity-60"
                        >
                          {updating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                          {action.label}
                        </button>
                      ))}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => updateStatus("cancelled")}
                        disabled={updating}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-primary bg-primary-soft px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
                      >
                        {updating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                        Cancel order
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right: timeline */}
          <section className="ph-card p-5">
            <h2 className="font-display text-xl font-semibold text-neutral">Order timeline</h2>
            <p className="mt-1 text-sm text-muted">
              Every status change, with who made it and when.
            </p>

            <ol className="relative mt-6 space-y-6 border-l-2 border-line pl-6">
              {order.timeline.map((entry, index) => {
                const isLast = index === order.timeline.length - 1;
                return (
                  <li key={entry.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full border-2 border-surface",
                        isLast ? "bg-primary text-white" : "bg-sunken text-muted",
                      )}
                      aria-hidden
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral">
                        {STATUS_LABELS[entry.status] ?? entry.status}
                      </p>
                      <p className="text-xs text-muted">
                        {entry.actorName}{" "}
                        <span className="capitalize">({entry.actorRole})</span>
                        {" · "}
                        {new Date(entry.at).toLocaleString()}
                      </p>
                      {entry.note && (
                        <p className="mt-1 text-sm text-muted">{entry.note}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
