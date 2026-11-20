"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pizza, Star, Clock, ShoppingCart, CreditCard, Plus } from "lucide-react";

type StatCard = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  label: string;
  color: string;
};

const CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian",
  "Meat Lovers",
  "Specialty/Gourmet",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<{ totalItems: number; activeItems: number; pendingOrders: number; acceptedOrders: number }>({
    totalItems: 0, activeItems: 0, pendingOrders: 0, acceptedOrders: 0,
  });
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({
    itemName: "", category: CATEGORIES[0], description: "", price: "", location: "", images: "",
  });

  useEffect(() => {
    loadStats();
    loadItems();
    loadOrders();
  }, []);

  async function loadStats() {
    try {
      const data = await api.get<any>("/api/vendor/stats");
      setStats(data);
    } catch { /* stats optional */ }
  }

  async function loadItems() {
    try {
      const data = await api.get<any[]>("/api/vendor/menu");
      setItems(data);
    } catch { /* items optional */ }
  }

  async function loadOrders() {
    try {
      const data = await api.get<any[]>("/api/vendor/orders");
      setOrders(data);
    } catch { /* orders optional */ }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/vendor/menu", {
        itemName: form.itemName,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        images: form.images ? [form.images] : [],
      });
      toast.success("Menu item created (pending approval)");
      setAddDialog(false);
      setForm({ itemName: "", category: CATEGORIES[0], description: "", price: "", location: "", images: "" });
      loadItems();
      loadStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create item");
    }
  }

  async function toggleAvailability(id: string, available: boolean) {
    try {
      await api.patch(`/api/vendor/menu/${id}/availability`, { available });
      toast.success(`Item ${available ? "available" : "unavailable"}`);
      loadItems();
      loadStats();
    } catch {
      toast.error("Failed to update availability");
    }
  }

  const statCards: StatCard[] = [
    { title: "Total Items", value: stats.totalItems, icon: Pizza, label: "Menu items published", color: "text-primary" },
    { title: "Active Items", value: stats.activeItems, icon: Star, label: "Approved & available", color: "text-emerald-500" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Clock, label: "Awaiting your action", color: "text-amber-500" },
    { title: "Accepted Orders", value: stats.acceptedOrders, icon: ShoppingCart, label: "Confirmed orders", color: "text-primary" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2">My Menu Items</h2>
            <Button onClick={() => setAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-body-sm text-muted-foreground text-center py-16">No menu items yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item._id} className="card-shape">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-h3 font-semibold">{item.itemName}</h3>
                        <p className="text-body-sm text-muted-foreground">{item.category} \u00B7 {item.location}</p>
                      </div>
                      <Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-body-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-label font-semibold text-primary">৳{item.price}</span>
                      <Button
                        size="sm"
                        variant={item.available ? "outline" : "destructive"}
                        onClick={() => toggleAvailability(item._id, !item.available)}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card-shape p-6">
            <h3 className="text-h3 font-semibold mb-6">Recent Orders</h3>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-body-sm text-muted-foreground text-center py-16">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div className="font-medium">{order.itemId?.itemName || "Item"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-body-sm">{order.customerId?.name || "Customer"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-body-sm">{new Date(order.deliveryDate).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={order.status === "accepted" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="card-shape p-6">
            <h3 className="text-h3 font-semibold mb-6">Subscription</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body-sm">Current Plan</span>
                <Badge variant="secondary">Free</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm">Active Items Limit</span>
                <span className="text-body-sm font-medium">3 / Unlimited</span>
              </div>
              <Button onClick={() => window.location.href = "/dashboard/vendor/subscription"} className="w-full btn-pill">
                <CreditCard className="h-4 w-4 mr-2" /> Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={addDialog}
        onOpenChange={setAddDialog}
      >
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Menu Item</AlertDialogTitle>
            <AlertDialogDescription>Add a new item to your menu (pending admin approval).</AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" required value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? CATEGORIES[0] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (৳)</Label>
                  <Input id="price" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Image URL (ImgBB)</Label>
                <Input id="images" placeholder="Paste ImgBB image URL" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="btn-pill">Create Item</Button>
              </div>
            </form>
          </AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
