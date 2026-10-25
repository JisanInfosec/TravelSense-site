"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, homeFor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { PasswordInput } from "./password-input";
import { safeNext } from "./login-form";

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 && p.length <= 72 },
  { label: "Contains a letter", test: (p: string) => /[A-Za-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-3">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.label} className={cn("flex items-center gap-1.5", ok ? "text-brand" : "text-muted")}>
            {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {r.label}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting) router.replace(homeFor(user.role));
  }, [loading, user, submitting, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name (at least 2 characters).";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Please enter a valid email address.";
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) errs.password = "Password does not meet the requirements below.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      router.replace(next ?? "/dashboard?welcome=1");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErrors({ email: err.message });
      else setFormError(err instanceof ApiError ? err.message : "Registration failed.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} placeholder="e.g. Nusrat Jahan" />
      </Field>
      <Field label="Email address" htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password}>
        <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set("password")} aria-invalid={!!errors.password} />
        <PasswordChecklist password={form.password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
        <PasswordInput id="confirm" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} aria-invalid={!!errors.confirm} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
