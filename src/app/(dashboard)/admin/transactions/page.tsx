"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TransactionRow = {
  _id: string;
  vendorId: { name: string; email: string; businessName?: string };
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await api.get<TransactionRow[]>("/api/admin/transactions");
      setTransactions(data);
    } catch {
      /* transactions optional */
    } finally {
      setLoading(false);
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
      <h2 className="text-h2">Transactions</h2>
      <p className="text-body-sm text-muted-foreground mb-6">Stripe payment records (read-only).</p>
      <Card className="card-shape">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-body-sm text-muted-foreground text-center py-10">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <div className="font-medium">{t.vendorId.name}</div>
                      <div className="text-body-xs text-muted-foreground">{t.vendorId.email}</div>
                    </TableCell>
                    <TableCell>{t.plan}</TableCell>
                    <TableCell>৳{(t.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "completed" ? "default" : "secondary"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-body-sm">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
