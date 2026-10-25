"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, CircleCheck, Clock3, Heart, MapPinned, MessageSquareText, Users, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { ModerationReview, Paginated, Reports } from "@/lib/types";
import { PageTitle } from "@/components/dashboard/side-nav";
import { StatTile } from "@/components/admin/stat-tile";
import { ModerationCard } from "@/components/admin/moderation-list";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

export default function AdminOverview() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: reports, error } = useSWR<Reports>(isAdmin ? "/admin/reports" : null);
  const { data: summary } = useSWR<Record<"PENDING" | "APPROVED" | "REJECTED", number>>("/moderation/reviews/summary");
  const { data: pending, mutate } = useSWR<Paginated<ModerationReview>>("/moderation/reviews?status=PENDING&limit=3");

  return (
    <div className="space-y-8">
      <PageTitle
        title={isAdmin ? "Admin overview" : "Moderation overview"}
        description={isAdmin ? "A snapshot of TravelSense activity." : "Reviews waiting for your decision."}
        action={isAdmin ? <LinkButton href="/admin/destinations/new">Add destination</LinkButton> : undefined}
      />

      {error && <ErrorState message={error.message} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatTile label="Total users" value={reports?.totals.users} icon={Users} hint={reports ? `+${reports.totals.newUsersLast30Days} in last 30 days` : undefined} />
            <StatTile label="Destinations" value={reports?.totals.destinations} icon={MapPinned} />
            <StatTile label="Pending reviews" value={reports?.totals.pendingReviews} icon={Clock3} tone="warn" />
            <StatTile label="Saved places" value={reports ? reports.totals.favorites + reports.totals.wishlist : undefined} icon={Heart} hint="Favourites + wishlist items" />
          </>
        ) : (
          <>
            <StatTile label="Pending" value={summary?.PENDING} icon={Clock3} tone="warn" />
            <StatTile label="Approved" value={summary?.APPROVED} icon={CircleCheck} />
            <StatTile label="Rejected" value={summary?.REJECTED} icon={XCircle} tone="danger" />
            <StatTile label="Total reviews" value={summary ? summary.PENDING + summary.APPROVED + summary.REJECTED : undefined} icon={MessageSquareText} tone="neutral" />
          </>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Oldest pending reviews</h2>
          <Link href="/admin/reviews" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            Open moderation queue <ArrowRight className="size-4" />
          </Link>
        </div>
        {!pending ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        ) : pending.items.length === 0 ? (
          <EmptyState icon={CircleCheck} title="All caught up" description="There are no reviews waiting for moderation." />
        ) : (
          <div className="space-y-3">
            {pending.items.map((r) => <ModerationCard key={r.id} r={r} onDone={() => mutate()} />)}
          </div>
        )}
      </section>
    </div>
  );
}
