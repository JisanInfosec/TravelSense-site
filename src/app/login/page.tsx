import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/states";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your favourites, wishlist and reviews.">
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
