"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordChecklist, PASSWORD_RULES } from "@/components/auth/register-form";
import { Avatar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function ProfileForm() {
  const { user } = useAuth();
  return user ? <ProfileFormInner user={user} key={user.id} /> : null;
}

function ProfileFormInner({ user }: { user: User }) {
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    city: user.city ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters.");
    setError(null);
    setSaving(true);
    try {
      await api("/users/me", { method: "PATCH", body: form });
      await refresh();
      toast("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={form.name || user.name} url={form.avatarUrl || null} size="lg" />
        <div>
          <h2 className="font-sans text-lg font-bold">Personal details</h2>
          <p className="text-sm text-muted">Your name is shown next to your public reviews.</p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="p-name">
          <Input id="p-name" value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Email address" htmlFor="p-email" hint="Contact an administrator to change your email.">
          <Input id="p-email" value={user.email} disabled />
        </Field>
        <Field label="Phone" htmlFor="p-phone" optional>
          <Input id="p-phone" value={form.phone} onChange={set("phone")} placeholder="+8801…" inputMode="tel" />
        </Field>
        <Field label="City" htmlFor="p-city" optional>
          <Input id="p-city" value={form.city} onChange={set("city")} placeholder="e.g. Dhaka" />
        </Field>
        <Field label="Profile photo URL" htmlFor="p-avatar" optional className="sm:col-span-2">
          <Input id="p-avatar" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://…" inputMode="url" />
        </Field>
        <Field label="About you" htmlFor="p-bio" optional className="sm:col-span-2" hint={`${form.bio.length}/500`}>
          <Textarea id="p-bio" value={form.bio} onChange={set("bio")} maxLength={500} placeholder="What kind of traveller are you?" />
        </Field>
      </div>
      <div className="mt-5 space-y-4">
        <FormError message={error} />
        <Button type="submit" loading={saving}>Save changes</Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) return setError("Please enter your current password.");
    if (!PASSWORD_RULES.every((r) => r.test(form.newPassword))) return setError("New password does not meet the requirements.");
    if (form.newPassword !== form.confirm) return setError("New passwords do not match.");
    setError(null);
    setSaving(true);
    try {
      await api("/users/me/password", { method: "PATCH", body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <h2 className="font-sans text-lg font-bold">Change password</h2>
      <p className="mb-5 text-sm text-muted">Passwords are stored securely as one-way hashes.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Current password" htmlFor="pw-current" className="sm:col-span-2">
          <PasswordInput id="pw-current" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} />
        </Field>
        <Field label="New password" htmlFor="pw-new">
          <PasswordInput id="pw-new" autoComplete="new-password" value={form.newPassword} onChange={set("newPassword")} />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm">
          <PasswordInput id="pw-confirm" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
        </Field>
      </div>
      <PasswordChecklist password={form.newPassword} />
      <div className="mt-5 space-y-4">
        <FormError message={error} />
        <Button type="submit" variant="secondary" loading={saving}>Update password</Button>
      </div>
    </form>
  );
}
