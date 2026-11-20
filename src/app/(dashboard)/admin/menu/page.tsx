"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type MenuItemRow = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  available: boolean;
  vendorId: string;
  vendorName?: string;
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const CATEGORIES = [
    "Classic Pizzas",
    "Vegetarian",
    "Meat Lovers",
    "Specialty/Gourmet",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];

  useEffect(() => {
    loadItems();
  }, [search, statusFilter, categoryFilter]);

  async function loadItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const data = await api.get<{ items: MenuItemRow[] }>(`/api/admin/menu?${params}`);
      setItems(data.items ?? []);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: string) {
    try {
      await api.patch(`/api/admin/menu/${id}/status`, { status });
      toast.success(`Item ${status}`);
      loadItems();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/api/admin/menu/${id}`);
      toast.success("Item deleted");
      loadItems();
    } catch {
      toast.error("Failed to delete item");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  const filtered = items.filter((i) => {
    const matchesSearch = i.itemName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || i.status === statusFilter;
    const matchesCategory = !categoryFilter || i.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">Manage Menu Items</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((i) => (
            <TableRow key={i._id}>
              <TableCell>
                <div className="font-medium">{i.itemName}</div>
                <div className="text-body-xs text-muted-foreground">{i.location}</div>
              </TableCell>
              <TableCell>{i.category}</TableCell>
              <TableCell>৳{i.price}</TableCell>
              <TableCell>
                <Badge variant={i.status === "approved" ? "default" : i.status === "rejected" ? "destructive" : "secondary"}>
                  {i.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStatus(i._id, i.status === "approved" ? "rejected" : "approved")}
                  variant={i.status === "approved" ? "outline" : "default"}
                >
                  {i.status === "approved" ? "Reject" : "Approve"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(i._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
