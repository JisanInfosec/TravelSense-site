"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { homeFor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { PasswordInput } from "./password-input";

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next ?? homeFor(user.role));
  }, [loading, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = "Please enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const u = await login(email.trim(), password);
      router.replace(next ?? homeFor(u.role));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Login failed.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field label="Email address" htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password}>
        <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Log in
      </Button>
      <p className="text-center text-sm text-muted">
        New to TravelSense?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
