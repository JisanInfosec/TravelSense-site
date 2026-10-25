"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

/** Hides administrator-only pages from moderators. The API enforces the same rule. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") {
    return (
      <EmptyState
        icon={Lock}
        title="Administrators only"
        description="Moderators can review and moderate user reviews, but cannot manage destinations, users or reports."
        action={<LinkButton href="/admin/reviews">Go to review moderation</LinkButton>}
      />
    );
  }
  return <>{children}</>;
}
