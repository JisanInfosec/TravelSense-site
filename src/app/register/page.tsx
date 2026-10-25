import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { Spinner } from "@/components/ui/states";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join TravelSense to save destinations and share your experiences.">
      <Suspense fallback={<Spinner />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
