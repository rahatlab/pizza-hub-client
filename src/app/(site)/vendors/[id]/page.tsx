"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, MapPin, Store } from "lucide-react";
import { MenuCard, type MenuItem } from "@/components/menu/menu-card";
import { SectionHeading } from "@/components/section-heading";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  businessLocation: string;
  image: string;
  plan: string;
}

export default function VendorStorefrontPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api<{ vendor: Vendor; items: (MenuItem & { _id?: string; id?: string })[] }>(
          `/api/vendor/public/${id}`,
        );
        if (cancelled) return;
        setVendor(data.vendor);
        setItems(
          (data.items ?? []).map((it) => ({ ...it, _id: it._id ?? it.id ?? "" })),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load vendor");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="ph-section">
        <div className="ph-container space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-sunken" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ph-card h-64 animate-pulse bg-sunken" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="ph-section">
        <div className="ph-container">
          <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span aria-hidden className="text-4xl">🍕</span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-neutral">Vendor not found</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {error ?? "This vendor may have been removed."}
            </p>
            <Link href="/menu" className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-section">
      <div className="ph-container space-y-10">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-neutral"
        >
          ← Back to menu
        </Link>

        <section className="ph-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-sunken text-2xl">
            {vendor.image ? (
              <Image src={vendor.image} alt={vendor.name} width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <Store className="h-6 w-6 text-muted" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold text-neutral">
              {vendor.businessName || vendor.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {vendor.businessLocation || "Location not set"}
              {vendor.plan === "premium" && (
                <span className="ml-2 inline-flex items-center rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  Premium
                </span>
              )}
            </p>
          </div>
        </section>

        <section>
          <SectionHeading
            title="Menu"
            description={`Items from ${vendor.businessName || vendor.name}`}
          />
          {items.length === 0 ? (
            <div className="mt-8">
              <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
                <span aria-hidden className="text-4xl">🍕</span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-neutral">No items yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  This vendor hasn't published any approved items.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}