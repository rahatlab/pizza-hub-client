"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Store, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
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

  // Keep filter in sync with ?role= deep links.
  useEffect(() => {
    const r = searchParams.get("role");
    if (r !== null && r !== roleFilter) setRoleFilter(r);
  }, [searchParams]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const data = await api<{ users: User[] }>(`/api/vendor/admin/users${qs ? `?${qs}` : ""}`);
      setUsers(data.users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users");
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search users"
            className="h-10 w-48 rounded-full border border-line bg-raised px-4 text-sm text-neutral outline-none focus:border-primary"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="h-10 rounded-full border border-line bg-raised px-4 text-sm text-neutral outline-none focus:border-primary"
          >
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </select>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="ph-card h-16 animate-pulse bg-sunken" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users" description="No accounts match this filter." emoji="👥" />
        ) : (
          <div className="ph-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-faint">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-sunken/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-sunken text-xs font-bold text-neutral">
                          {u.image ? (
                            <img src={u.image} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            u.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </span>
                        <div>
                          <p className="font-medium text-neutral">{u.name}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                          {u.businessName && (
                            <p className="text-xs text-faint">{u.businessName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{u.plan ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {(u.isBlocked ?? false) && (
                        <span className="mb-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Blocked
                        </span>
                      )}
                      {u.id !== currentUser?.id && (
                        <select
                          value={u.role}
                          onChange={(e) => {
                            if (e.target.value !== u.role) {
                              setRoleChangeTarget({ user: u, role: e.target.value });
                            }
                          }}
                          disabled={changing === u.id || (u.isBlocked ?? false)}
                          className="h-8 rounded-lg border border-line bg-raised px-2 text-xs text-neutral outline-none focus:border-primary disabled:opacity-60"
                        >
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => setBlockTarget(u)}
                          disabled={blocking === u.id}
                          className="ml-2 inline-flex h-8 items-center rounded-lg border border-line bg-raised px-2 text-xs font-semibold text-neutral transition-colors hover:border-line-strong disabled:opacity-60"
                        >
                          {blocking === u.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (u.isBlocked ?? false) ? (
                            "Unblock"
                          ) : (
                            "Block"
                          )}
                        </button>
                      )}
                      {changing === u.id && (
                        <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-muted" aria-hidden />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
