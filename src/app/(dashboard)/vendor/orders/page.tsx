"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/api/vendor/orders");
      setOrders(data);
    } catch {
      /* orders optional */
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: "accepted" | "rejected") {
    try {
      await api.patch(`/api/vendor/orders/${id}`, { status });
      toast.success(`Order ${status}`);
      loadOrders();
    } catch {
      toast.error("Failed to update order");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-h2">Customer Orders</h2>
      <p className="text-body-sm text-muted-foreground mb-6">Orders placed by customers for your menu items.</p>
      <Card className="card-shape">
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-body-sm text-muted-foreground text-center py-10">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <div className="font-medium">{order.itemId?.itemName || "Item"}</div>
                    </TableCell>
                    <TableCell>{order.customerId?.name || "Customer"}</TableCell>
                    <TableCell>
                      <div className="text-body-sm">{new Date(order.deliveryDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-body-sm line-clamp-1">{order.deliveryAddress}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "accepted" ? "default" : order.status === "rejected" || order.status === "cancelled" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatus(order._id, "accepted")}
                            variant="default"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatus(order._id, "rejected")}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
