"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MapPin, Star, Store } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ItemDetail {
  id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  vendorId: string;
  status: string;
  ratingAvg: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export default function MenuItemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api<ItemDetail>(`/api/menu/${id}`, { auth: false });
      setItem(data);
      setActiveImage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this item");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await api(`/api/menu/${id}/reviews`, {
        method: "POST",
        body: { rating, comment },
      });
      toast.success("Thanks for your review!");
      setComment("");
      setRating(5);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post your review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="ph-section">
        <div className="ph-container grid gap-8 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-sunken" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-sunken" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-sunken" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-sunken" />
            <div className="h-20 w-full animate-pulse rounded bg-sunken" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="ph-section">
        <div className="ph-container">
          <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span aria-hidden className="text-4xl">
              🍕
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-neutral">
              Item not found
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {error ?? "This menu item may have been removed or is not available."}
            </p>
            <Link href="/menu" className={cn(buttonVariants({ size: "sm" }), "mt-6")}>
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = item.images.length > 0 ? item.images : null;
  const alreadyReviewed =
    user && item.reviews.some((review) => review.customerId === user.id);

  return (
    <div className="ph-section">
      <div className="ph-container space-y-10">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-neutral"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to menu
        </Link>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-sunken">
              {images ? (
                <Image
                  src={images[activeImage]}
                  alt={item.itemName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-6xl">🍕</div>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="flex gap-2">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-lg border transition-colors",
                      index === activeImage ? "border-primary" : "border-line",
                    )}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === activeImage}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                {item.category}
              </p>
              <h1 className="mt-1 font-display text-4xl font-semibold text-neutral">
                {item.itemName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                  <span className="font-semibold text-neutral">
                    {item.ratingAvg > 0 ? item.ratingAvg.toFixed(1) : "New"}
                  </span>
                  <span>
                    ({item.ratingCount} {item.ratingCount === 1 ? "review" : "reviews"})
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {item.location}
                </span>
              </div>
            </div>

            <p className="text-2xl font-bold text-primary">
              ${item.price.toFixed(2)}
            </p>

            {item.description && (
              <p className="max-w-none text-base leading-relaxed text-muted">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
              >
                Add to cart
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-raised px-6 text-sm font-semibold text-neutral transition-colors hover:border-line-strong"
              >
                Save to favourites
              </button>
            </div>

            <p className="text-xs text-faint">
              Vendor ID: {item.vendorId} · Added{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* Reviews */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-neutral">
                Reviews
              </h2>
              <p className="text-sm text-muted">
                {item.ratingCount === 0
                  ? "No reviews yet — be the first to try it."
                  : `${item.ratingCount} ${item.ratingCount === 1 ? "person has" : "people have"} rated this item.`}
              </p>
            </div>
          </div>

          {user?.role === "customer" && !alreadyReviewed && (
            <form onSubmit={submitReview} className="ph-card space-y-4 p-5">
              <p className="text-sm font-semibold text-neutral">Leave a review</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`Rate ${value} out of 5`}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          value <= rating ? "fill-gold text-gold" : "text-faint",
                        )}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What did you think? (optional)"
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-line bg-raised px-3.5 py-2.5 text-sm text-neutral outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {submitting ? "Posting…" : "Post review"}
                </button>
              </div>
            </form>
          )}

          {user?.role === "customer" && alreadyReviewed && (
            <p className="text-sm text-muted">
              You have already reviewed this item — thank you!
            </p>
          )}

          {!user && (
            <p className="text-sm text-muted">
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          {item.reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {item.reviews.map((review) => (
                <li key={review.id} className="ph-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral">
                      {review.customerName}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-3.5 w-3.5",
                            index < review.rating ? "fill-gold text-gold" : "text-faint",
                          )}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{review.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-faint">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
