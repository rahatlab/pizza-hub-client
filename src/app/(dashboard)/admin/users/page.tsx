"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Store, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  plan: string;
  isBlocked?: boolean;
  createdAt: string;
  businessName: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") ?? "");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [changing, setChanging] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: User; role: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function load() {
    setLoading(true);
    try {
      setError(null);
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const data = await api<{ users: User[] }>(`/api/vendor/admin/users${qs ? `?${qs}` : ""}`);
      setUsers(data.users);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not load users";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [roleFilter, debouncedSearch]);

  async function confirmChangeRole() {
    if (!roleChangeTarget) return;
    const { user: u, role } = roleChangeTarget;
    setChanging(u.id);
    try {
      await api(`/api/vendor/admin/users/${u.id}/role`, {
        method: "PATCH",
        body: { role },
      });
      toast.success("Role updated");
      setRoleChangeTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change role");
    } finally {
      setChanging(null);
    }
  }

  async function confirmBlock() {
    if (!blockTarget) return;
    const next = !(blockTarget.isBlocked ?? false);
    setBlocking(blockTarget.id);
    try {
      await api(`/api/vendor/admin/users/${blockTarget.id}/block`, {
        method: "PATCH",
        body: { blocked: next },
      });
      toast.success(next ? "User blocked" : "User unblocked");
      setBlockTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update user");
    } finally {
      setBlocking(null);
    }
  }

  return (
    <RequireAuth roles={["admin"]}>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-neutral">Users</h1>
            <p className="mt-1 text-sm text-muted">
              Every registered customer, vendor and admin on the platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
              className="h-10 w-48"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 w-40">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="ph-card h-16 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : error ? (
          <div className="ph-card p-8 text-center">
            <p className="text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 inline-flex h-9 items-center rounded-full border border-line bg-raised px-4 text-sm font-medium text-neutral transition-colors hover:bg-sunken"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users" description="No accounts match this filter." emoji="👥" />
        ) : (
          <div className="ph-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {u.image && <AvatarImage src={u.image} alt={u.name} />}
                          <AvatarFallback>
                            {u.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-neutral">{u.name}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                          {u.businessName && (
                            <p className="text-xs text-faint">{u.businessName}</p>
                          )}
                          {(u.isBlocked ?? false) && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Blocked
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs font-semibold capitalize text-muted">
                        {u.role === "admin" ? (
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                        ) : u.role === "vendor" ? (
                          <Store className="h-3 w-3" aria-hidden />
                        ) : (
                          <UserRound className="h-3 w-3" aria-hidden />
                        )}
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-muted">{u.plan ?? "—"}</TableCell>
                    <TableCell className="text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.id !== currentUser?.id && (
                          <>
                            <Select
                              value={u.role}
                              onValueChange={(role) => {
                                if (role !== u.role) {
                                  setRoleChangeTarget({ user: u, role });
                                }
                              }}
                              disabled={changing === u.id || (u.isBlocked ?? false)}
                            >
                              <SelectTrigger className="h-8 w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => setBlockTarget(u)}
                              disabled={blocking === u.id}
                              className="inline-flex h-8 items-center rounded-lg border border-line bg-raised px-2 text-xs font-semibold text-neutral transition-colors hover:border-line-strong disabled:opacity-60"
                            >
                              {blocking === u.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                              ) : (u.isBlocked ?? false) ? (
                                "Unblock"
                              ) : (
                                "Block"
                              )}
                            </button>
                          </>
                        )}
                        {changing === u.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" aria-hidden />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={roleChangeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRoleChangeTarget(null);
        }}
        title="Change user role?"
        description={
          roleChangeTarget
            ? `Change ${roleChangeTarget.user.name}'s role to ${roleChangeTarget.role}?`
            : undefined
        }
        confirmLabel="Change role"
        loading={changing !== null}
        onConfirm={confirmChangeRole}
      />

      <ConfirmDialog
        open={blockTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
        title={blockTarget?.isBlocked ? "Unblock user?" : "Block user?"}
        description={
          blockTarget
            ? `${blockTarget.isBlocked ? "Unblock" : "Block"} ${blockTarget.name}? Blocked users cannot use protected features.`
            : undefined
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock" : "Block"}
        destructive={!blockTarget?.isBlocked}
        loading={blocking !== null}
        onConfirm={confirmBlock}
      />
    </RequireAuth>
  );
}