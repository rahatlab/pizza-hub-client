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

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [blockDialog, setBlockDialog] = useState({ open: false, id: "", blocked: false });

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const data = await api.get<{ users: UserRow[] }>(`/api/admin/users?${params}`);
      setUsers(data.users ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock(id: string, blocked: boolean) {
    try {
      await api.patch(`/api/admin/users/${id}/block`, { blocked });
      toast.success(`User ${blocked ? "blocked" : "unblocked"}`);
      setBlockDialog({ open: false, id: "", blocked: false });
      loadUsers();
    } catch {
      toast.error("Failed to update user");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">Manage Users</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u._id}>
              <TableCell>
                <div className="font-medium">{u.name}</div>
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{u.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={u.isBlocked ? "destructive" : "secondary"}>
                  {u.isBlocked ? "Blocked" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog
                  open={blockDialog.open && blockDialog.id === u._id}
                  onOpenChange={(open) => setBlockDialog({ open, id: open ? u._id : "", blocked: !u.isBlocked })}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3">
                      {u.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{u.isBlocked ? "Unblock User" : "Block User"}</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to {u.isBlocked ? "unblock" : "block"} {u.name}?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleBlock(u._id, !u.isBlocked)} className="text-destructive">
                        {u.isBlocked ? "Unblock" : "Block"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
