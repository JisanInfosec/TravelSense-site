"use client";

import { BarChart3, LayoutDashboard, MapPinned, MessageSquareText, UserRound, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/utils";
import { RequireRole } from "@/components/auth/require-role";
import { SideNav } from "@/components/dashboard/side-nav";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/destinations", label: "Destinations", icon: MapPinned },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/profile", label: "My profile", icon: UserRound },
];
const MODERATOR_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/profile", label: "My profile", icon: UserRound },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["ADMIN", "MODERATOR"]}>
      <Inner>{children}</Inner>
    </RequireRole>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 hidden rounded-2xl bg-brand-dark p-4 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">Staff console</p>
          <p className="mt-1 truncate font-semibold">{user?.name}</p>
          <p className="text-xs text-white/70">{user && ROLE_LABELS[user.role]}</p>
        </div>
        <SideNav items={user?.role === "ADMIN" ? ADMIN_NAV : MODERATOR_NAV} />
      </aside>
      <div className="min-w-0 animate-fade-up">{children}</div>
    </div>
  );
}
