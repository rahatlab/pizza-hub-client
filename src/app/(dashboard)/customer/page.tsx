"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Clock, Star, Truck, DollarSign } from "lucide-react";

type StatCard = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  label: string;
  color: string;
};

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<{ total: number; pending: number; accepted: number; rejected: number }>({
    total: 0, pending: 0, accepted: 0, rejected: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, id: "" });

  useEffect(() => {
    loadStats();
    loadOrders();
  }, []);

  async function loadStats() {
    try {
      const data = await api.get<{ total: number; pending: number; accepted: number; rejected: number }>(
        "/api/customer/stats"
      );
      setStats(data);
    } catch {
      /* stats optional */
    }
  }

  async function loadOrders() {
    try {
      const data = await api.get<any[]>("/api/customer/orders");
      setOrders(data);
    } catch {
      /* orders optional */
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(id: string) {
    try {
      await api.patch(`/api/customer/orders/${id}/cancel`);
      toast.success("Order cancelled");
      setCancelDialog({ open: false, id: "" });
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  }

  const statCards: StatCard[] = [
    { title: "Total Orders", value: stats.total, icon: Truck, label: "All orders placed", color: "text-primary" },
    { title: "Pending", value: stats.pending, icon: Clock, label: "Awaiting vendor response", color: "text-amber-500" },
    { title: "Accepted", value: stats.accepted, icon: Star, label: "Confirmed by vendor", color: "text-emerald-500" },
    { title: "Cancelled", value: stats.rejected, icon: DollarSign, label: "Cancelled by you/vendor", color: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-shape">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-body-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">My Orders</h2>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-body-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Vendor</TableHead>
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
                    <div className="text-body-xs text-muted-foreground">{order.itemId?.category || ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-body-sm">{order.vendorId?.name || "Vendor"}</div>
                  </TableCell>
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
                      <AlertDialog
                        open={cancelDialog.open && cancelDialog.id === order._id}
                        onOpenChange={(open) => setCancelDialog({ open, id: open ? order._id : "" })}
                      >
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-8 px-3">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>Cancel this pending order?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelOrder(order._id)}>
                              Yes, cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
