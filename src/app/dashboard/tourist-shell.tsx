"use client";

import { Heart, LayoutDashboard, Map, MessageSquareText, UserRound } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import { SideNav } from "@/components/dashboard/side-nav";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/favorites", label: "Favourite places", icon: Heart },
  { href: "/dashboard/wishlist", label: "Travel wishlist", icon: Map },
  { href: "/dashboard/reviews", label: "My reviews", icon: MessageSquareText },
  { href: "/dashboard/profile", label: "Edit profile", icon: UserRound },
];

export function TouristShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["TOURIST"]}>
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden px-4 text-xs font-bold uppercase tracking-[0.14em] text-muted lg:block">My TravelSense</p>
          <SideNav items={NAV} />
        </aside>
        <div className="min-w-0 animate-fade-up">{children}</div>
      </div>
    </RequireRole>
  );
}
