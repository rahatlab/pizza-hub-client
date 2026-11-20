"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiClientError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendorId: string;
  vendorName?: string;
  status: string;
  available: boolean;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
};

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [item, setItem] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  useEffect(() => {
    loadItem();
    loadReviews();
  }, [itemId]);

  async function loadItem() {
    try {
      const data = await api.get<MenuItem>(`/api/menu/${itemId}`);
      setItem(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 404) {
        toast.error("Item not found");
        router.push("/menu");
      } else {
        toast.error("Failed to load item");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const data = await api.get<{ reviews: Review[]; averageRating: number; count: number }>(
        `/api/reviews/${itemId}`
      );
      setReviews(data.reviews ?? []);
    } catch {
      /* reviews may not exist yet */
    }
  }

  async function handleOrder() {
    setOrderDialogOpen(true);
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="mt-4 h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="mt-4 h-4 w-1/2" />
          </div>
        </div>
      </section>
    );
  }

  if (!item) return null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="relative h-80 rounded-2xl overflow-hidden mb-4">
            <img
              src={item.images?.[0] || "/placeholder.svg"}
              alt={item.itemName}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-h1 mb-2">{item.itemName}</h1>
          <p className="text-label text-primary mb-2">
            {item.category} • {item.location}
          </p>
          <p className="text-body-lg mb-6">{item.description}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-h3 font-bold">
              ৳{item.price}
            </span>
            <div className="flex items-center gap-1 text-body-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-yellow-400 ${
                    i < Number(avgRating) ? "text-fill" : "text-muted"
                  `}
                "}
              >
                ★
              </span>
            ))}
              <span className="ml-1">({avgRating})</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {item.status !== "approved" || !item.available ? (
              <Button variant="outline" disabled className="w-full">
                {item.status !== "approved" ? "Not available" : "Out of stock"}
              </Button>
            ) : (
              <Button onClick={handleOrder} className="w-full btn-pill">
                Order Now
              </Button>
            )}
            <Button variant="outline" onClick={() => setOrderDialogOpen(true)}>
              View Details
            </Button>
          </div>

          <div className="mt-10">
            <h2 className="text-h2 mb-4">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">
                No reviews yet. Be the first to review this item!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 border border-border rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{r.customerName}</span>
                      <span className="text-yellow-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </span>
                    </div>
                    <p className="text-body-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 p-6 border border-border rounded-2xl bg-card">
            <h2 className="text-h2 mb-4">Order</h2>
            <p className="text-body-sm text-muted-foreground mb-6">
              {item.itemName} — ৳{item.price}
            </p>
            <Button
              onClick={handleOrder}
              disabled={item.status !== "approved" || !item.available}
              className="w-full btn-pill mb-4"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
      >
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Place Order</AlertDialogTitle>
            <AlertDialogDescription>
              Order {item.itemName} for delivery. You&apos;ll be redirected to enter delivery details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setOrderDialogOpen(false);
              router.push(`/order/${itemId}`);
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
