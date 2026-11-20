"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiClientError } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function OrderFormPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/orders", {
        itemId,
        deliveryDate,
        deliveryAddress,
        message,
      });
      toast.success("Order placed successfully");
      router.push("/dashboard/customer");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to place order");
      }
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Card className="card-shape">
        <CardHeader>
          <CardTitle className="text-h1">Place Your Order</CardTitle>
          <CardDescription>Enter delivery details for your pizza.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input id="deliveryDate" type="date" min={minDate} required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input id="deliveryAddress" type="text" required placeholder="House, Road, Area, City" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (optional)</Label>
              <Textarea id="message" rows={3} placeholder="Any special instructions?" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button type="submit" className="w-full btn-pill" disabled={loading}>
              {loading ? "Placing order..." : "Place Order"}
            </Button>
            <p className="text-body-xs text-muted-foreground text-center mt-4">
              No payment required — order will be confirmed by the vendor.
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
