"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function VendorSubscriptionPage() {
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    try {
      const data = await api.get<any>("/api/vendor/stats");
      // We don't have plan in stats, but assume free for now
      setPlan("free");
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    try {
      const data = await api.post<{ url: string }>("/api/payment/checkout");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create checkout session");
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-h2">Subscription</h2>
      <p className="text-body-sm text-muted-foreground mb-6">Upgrade to Premium for unlimited menu items and featured placement.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-shape p-6">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>For getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">৳0</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-body-sm">✓ Up to 3 active menu items</li>
              <li className="flex items-center gap-2 text-body-sm">✓ Basic order management</li>
              <li className="flex items-center gap-2 text-body-sm line-through">✗ Unlimited items</li>
              <li className="flex items-center gap-2 text-body-sm line-through">✗ Featured placement</li>
              <li className="flex items-center gap-2 text-body-sm line-through">✗ Premium badge</li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === "free" ? (
              <Button variant="outline" className="w-full" disabled>Current Plan</Button>
            ) : (
              <Button onClick={handleUpgrade} className="w-full btn-pill">
                <CreditCard className="h-4 w-4 mr-2" /> Upgrade to Premium
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="card-shape p-6 ring-2 ring-primary">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle>Premium Plan</CardTitle>
            <CardDescription>For growing vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">৳499<span className="text-body-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-body-sm">✓ Unlimited active menu items</li>
              <li className="flex items-center gap-2 text-body-sm">✓ Featured homepage placement</li>
              <li className="flex items-center gap-2 text-body-sm">✓ Premium badge on items</li>
              <li className="flex items-center gap-2 text-body-sm">✓ Priority order notifications</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpgrade} className="w-full btn-pill">
              <CreditCard className="h-4 w-4 mr-2" /> Subscribe to Premium
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
