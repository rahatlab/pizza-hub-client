"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  ratingAvg: number;
  ratingCount: number;
}

const CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian",
  "Meat Lovers",
  "Specialty / Gourmet",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-tertiary-soft text-tertiary",
  rejected: "bg-primary-soft text-primary",
  inactive: "bg-sunken text-muted",
};

export default function VendorMenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [activeCount, setActiveCount] = useState(0);
  const [limit, setLimit] = useState<number | null>(3);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ items: MenuItem[]; plan: string; activeCount: number; limit: number | null }>(
        "/api/vendor/menu",
      );
      setItems(data.items);
      setPlan(data.plan as "free" | "premium");
      setActiveCount(data.activeCount);
      setLimit(data.limit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setPrice("");
    setLocation("");
    setImages([]);
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setName(item.itemName);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(String(item.price));
    setLocation(item.location);
    setImages(item.images);
    setShowForm(true);
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !price || !location.trim()) {
      toast.error("Name, price and location are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        itemName: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        location: location.trim(),
        images,
      };
      if (editing) {
        await api(`/api/menu/${editing.id}`, { method: "PATCH", body });
        toast.success("Item updated");
      } else {
        await api("/api/menu", { method: "POST", body });
        toast.success("Item submitted for approval");
      }
      setShowForm(false);
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: MenuItem) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/menu/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Item deleted");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete item");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(item: MenuItem) {
    const newStatus = item.status === "inactive" ? "pending" : "inactive";
    try {
      await api(`/api/menu/${item.id}`, { method: "PATCH", body: { status: newStatus } });
      toast.success(newStatus === "inactive" ? "Item hidden" : "Item re-submitted for approval");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const isAdmin = user?.role === "admin";
  const atLimit = !isAdmin && plan !== "premium" && limit !== null && activeCount >= limit;

  return (
    <RequireAuth roles={["vendor", "admin"]}>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-neutral">Menu items</h1>
            <p className="mt-1 text-sm text-muted">
              {plan === "premium"
                ? "Premium plan — unlimited items."
                : `Free plan — ${activeCount} of ${limit} active items used.`}
            </p>
          </div>
          {!isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              disabled={atLimit}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add item
            </button>
          )}
        </header>

        {atLimit && !isAdmin && (
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm">
            <p className="font-semibold text-neutral">Free plan limit reached</p>
            <p className="mt-1 text-muted">
              You have {activeCount} of {limit} active items. Upgrade to Premium to publish
              unlimited items.
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ph-card h-48 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Your menu is empty"
            description="Publish your first pizza, side or drink and it will show up on the public menu after approval."
            emoji="🧑‍🍳"
            onAction={openCreate}
            actionLabel="Add your first item"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="ph-card flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] w-full bg-sunken">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.itemName}
                      fill
                      sizes="(max-width: 640px) 90vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl">🍕</div>
                  )}
                  <span
                    className={cn(
                      "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                      STATUS_COLORS[item.status] ?? "bg-sunken text-muted",
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-neutral">{item.itemName}</h3>
                    <span className="font-display text-lg font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{item.category} · {item.location}</p>
                  {item.description && (
                    <p className="line-clamp-2 text-sm text-muted">{item.description}</p>
                  )}
                  {item.ratingCount > 0 && (
                    <p className="text-xs text-muted">
                      ★ {item.ratingAvg.toFixed(1)} ({item.ratingCount})
                    </p>
                  )}
                  <div className="mt-auto flex gap-2 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-neutral transition-colors hover:border-line-strong"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(item)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-neutral transition-colors hover:border-line-strong"
                    >
                      {item.status === "inactive" ? "Re-activate" : "Hide"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-primary transition-colors hover:bg-primary-soft"
                      aria-label={`Delete ${item.itemName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="ph-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-neutral">
                  {editing ? "Edit item" : "New menu item"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-raised text-muted hover:text-neutral"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Margherita"
                    className="h-10 w-full rounded-xl border border-line bg-raised px-3.5 text-sm text-neutral outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Classic tomato, mozzarella and basil"
                    className="w-full rounded-xl border border-line bg-raised px-3.5 py-2.5 text-sm text-neutral outline-none focus:border-primary"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-line bg-raised px-3.5 text-sm text-neutral outline-none focus:border-primary"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral">Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="8.50"
                      className="h-10 w-full rounded-xl border border-line bg-raised px-3.5 text-sm text-neutral outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dhanmondi, Dhaka"
                    className="h-10 w-full rounded-xl border border-line bg-raised px-3.5 text-sm text-neutral outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral">Images</label>
                  <div className="flex flex-wrap gap-2">
                    {images.map((url, i) => (
                      <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                        <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-black/60 text-white"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed border-line bg-sunken text-muted hover:border-primary hover:text-primary">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Upload className="h-4 w-4" aria-hidden />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-faint">Upload via ImgBB · max 5MB</p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="inline-flex h-10 items-center rounded-full border border-line bg-raised px-5 text-sm font-semibold text-neutral hover:border-line-strong"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                    {saving ? "Saving…" : editing ? "Save changes" : "Submit for approval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete menu item?"
        description={
          deleteTarget ? `Delete "${deleteTarget.itemName}"? This cannot be undone.` : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </RequireAuth>
  );
}
