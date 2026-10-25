"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { homeFor } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/states";

/**
 * Client-side gate for protected pages. This only improves UX — every protected API
 * endpoint is independently authorised on the server.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) return <Spinner className="py-40" />;
  if (!roles.includes(user.role)) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Lock}
          title="You don't have access to this page"
          description="This area is only available to a different type of account."
          action={<LinkButton href={homeFor(user.role)}>Go to my dashboard</LinkButton>}
        />
      </div>
    );
  }
  return <>{children}</>;
}
