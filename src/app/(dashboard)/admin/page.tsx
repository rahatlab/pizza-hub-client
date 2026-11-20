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
import { Users, Pizza, CreditCard, Shield, Clock } from "lucide-react";

type StatCard = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  label: string;
  color: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{ totalUsers: number; totalVendors: number; totalCustomers: number; totalMenuItems: number; pendingItems: number; totalTransactions: number }>({
    totalUsers: 0, totalVendors: 0, totalCustomers: 0, totalMenuItems: 0, pendingItems: 0, totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.get<any>("/api/admin/stats");
      setStats(data);
    } catch { /* stats optional */ } finally {
      setLoading(false);
    }
  }

  async function handleBlock(userId: string, blocked: boolean) {
    try {
      await api.patch(`/api/admin/users/${userId}/block`, { blocked });
      toast.success(`User ${blocked ? "blocked" : "unblocked"}`);
      loadStats();
    } catch {
      toast.error("Failed to update user");
    }
  }

  const statCards: StatCard[] = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, label: "Registered accounts", color: "text-primary" },
    { title: "Vendors", value: stats.totalVendors, icon: Shield, label: "Restaurant partners", color: "text-primary" },
    { title: "Customers", value: stats.totalCustomers, icon: Clock, label: "Buyers", color: "text-primary" },
    { title: "Menu Items", value: stats.totalMenuItems, icon: Pizza, label: "Published items", color: "text-primary" },
    { title: "Pending Items", value: stats.pendingItems, icon: Clock, label: "Awaiting approval", color: "text-amber-500" },
    { title: "Transactions", value: stats.totalTransactions, icon: CreditCard, label: "Stripe payments", color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="card-shape p-6">
            <h3 className="text-h3 font-semibold mb-6">Pending Menu Items</h3>
            <p className="text-body-sm text-muted-foreground mb-6">Review and approve/reject items.</p>
            <Button onClick={() => window.location.href = "/dashboard/admin/menu"} className="w-full btn-pill">
              Manage Menu Items
            </Button>
          </div>
          <div className="card-shape p-6">
            <h3 className="text-h3 font-semibold mb-6">User Management</h3>
            <p className="text-body-sm text-muted-foreground mb-6">View users, block/unblock accounts.</p>
            <Button onClick={() => window.location.href = "/dashboard/admin/users"} className="w-full btn-pill">
              Manage Users
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-shape p-6">
            <h3 className="text-h3 font-semibold mb-6">Transactions</h3>
            <p className="text-body-sm text-muted-foreground mb-6">Stripe payment records (read-only).</p>
            <Button onClick={() => window.location.href = "/dashboard/admin/transactions"} className="w-full btn-pill">
              View Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
