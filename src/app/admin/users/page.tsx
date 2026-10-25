"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AdminUser, Paginated, Role } from "@/lib/types";
import { cn, formatDate, ROLE_LABELS } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { AdminOnly } from "@/components/admin/admin-only";
import { PasswordChecklist, PASSWORD_RULES } from "@/components/auth/register-form";
import { PasswordInput } from "@/components/auth/password-input";
import { Avatar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

const ROLE_TONE: Record<Role, "green" | "info" | "neutral"> = { ADMIN: "green", MODERATOR: "info", TOURIST: "neutral" };

export default function UsersPage() {
  return (
    <AdminOnly>
      <UsersManager />
    </AdminOnly>
  );
}

function UsersManager() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page), limit: "15" });
  if (debounced) params.set("q", debounced);
  if (role) params.set("role", role);
  const { data, error, mutate } = useSWR<Paginated<AdminUser>>(`/admin/users?${params}`, { keepPreviousData: true });

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/admin/users/${toDelete.id}`, { method: "DELETE" });
      toast(`${toDelete.name}'s account was removed.`);
      setToDelete(null);
      void mutate();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not delete user.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageTitle
        title="User management"
        description="Search accounts, remove users and create staff accounts."
        action={<Button onClick={() => setCreating(true)}><UserPlus className="size-4" /> Create staff account</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <Select value={role} onChange={(e) => {
            setRole(e.target.value as Role | "");
            setPage(1);
          }} className="h-11 rounded-full" wrapperClassName="sm:w-48" aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="TOURIST">Tourists</option>
          <option value="MODERATOR">Moderators</option>
          <option value="ADMIN">Administrators</option>
        </Select>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !data ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : data.items.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try another search or role filter." />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,2fr)_8rem_8rem_7rem_3rem] gap-4 border-b border-line bg-canvas/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted md:grid">
            <span>User</span><span>Role</span><span>Activity</span><span>Joined</span><span />
          </div>
          <ul className="divide-y divide-line">
            {data.items.map((u) => (
              <li key={u.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[minmax(0,2fr)_8rem_8rem_7rem_3rem] md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} url={u.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {u.name} {u.id === me?.id && <span className="text-xs font-normal text-muted">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{u.email}</p>
                  </div>
                </div>
                <div className="order-last col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 text-xs text-muted md:order-none md:contents md:pl-0">
                  <span><Badge tone={ROLE_TONE[u.role]}>{ROLE_LABELS[u.role]}</Badge></span>
                  <span className="md:text-sm">{u._count.reviews} reviews · {u._count.favorites + u._count.wishlist} saved</span>
                  <span className="md:text-sm">{formatDate(u.createdAt)}</span>
                </div>
                <button
                  onClick={() => setToDelete(u)}
                  disabled={u.id === me?.id}
                  className={cn("grid size-9 place-items-center justify-self-end rounded-full text-muted transition hover:bg-danger-soft hover:text-danger disabled:invisible")}
                  aria-label={`Delete ${u.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted">Page {page} of {data.totalPages} · {data.total} users</span>
              <Button size="sm" variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this account?"
        message={
          <>
            <strong className="text-ink">{toDelete?.name}</strong> ({toDelete?.email}) will be permanently removed, together with their
            reviews, favourites and wishlist. This cannot be undone.
          </>
        }
        confirmLabel="Delete account"
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
      <CreateStaffDialog open={creating} onClose={() => setCreating(false)} onCreated={() => mutate()} />
    </>
  );
}

function CreateStaffDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const empty = { name: "", email: "", password: "", role: "MODERATOR" as "MODERATOR" | "ADMIN" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const close = () => {
    setForm(empty);
    setError(null);
    onClose();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) return setError("Password does not meet the requirements.");
    setSaving(true);
    setError(null);
    try {
      await api("/admin/users", { method: "POST", body: form });
      toast(`${ROLE_LABELS[form.role]} account created for ${form.name}.`);
      onCreated();
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Create staff account"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={() => submit()} loading={saving}>Create account</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">Moderators can moderate reviews only. Administrators have full access.</p>
        <Field label="Role" htmlFor="s-role">
          <Select id="s-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "MODERATOR" | "ADMIN" })}>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Administrator</option>
          </Select>
        </Field>
        <Field label="Full name" htmlFor="s-name">
          <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" htmlFor="s-email">
          <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Temporary password" htmlFor="s-pw" hint="Share it securely; the user can change it from their profile.">
          <PasswordInput id="s-pw" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <PasswordChecklist password={form.password} />
        </Field>
        <FormError message={error} />
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
