"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import useSWR from "swr";
import { ArrowRight, CalendarDays, CheckCircle2, Heart, Map, MapPin, MessageSquareText, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { OwnReview, User, WishlistEntry } from "@/lib/types";
import { formatDate, sizedImage } from "@/lib/utils";
import { Avatar } from "@/components/layout/navbar";
import { LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useSWR<User>("/auth/me");
  const { data: wishlist } = useSWR<WishlistEntry[]>("/me/wishlist");
  const { data: reviews } = useSWR<OwnReview[]>("/reviews/mine");
  const p = profile ?? user!;

  const stats = [
    { label: "Favourites", value: p.stats?.favorites, icon: Heart, href: "/dashboard/favorites" },
    { label: "In wishlist", value: p.stats?.wishlist, icon: Map, href: "/dashboard/wishlist" },
    { label: "Visited", value: p.stats?.visited, icon: CheckCircle2, href: "/dashboard/wishlist?filter=visited" },
    { label: "Reviews", value: p.stats?.reviews, icon: MessageSquareText, href: "/dashboard/reviews" },
  ];
  const upcoming = wishlist?.filter((w) => !w.visited).slice(0, 3);

  return (
    <div className="space-y-8">
      <Suspense>
        <WelcomeToast />
      </Suspense>

      {/* Profile summary */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-dark p-6 text-white sm:p-8">
        <div aria-hidden className="absolute -right-20 -top-24 size-72 rounded-full bg-brand/60 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={p.name} url={p.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/70">Welcome back,</p>
            <h1 className="truncate text-3xl font-semibold">{p.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75">
              <span>{p.email}</span>
              {p.city && (
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {p.city}</span>
              )}
              <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> Member since {formatDate(p.createdAt, { month: "long", year: "numeric" })}</span>
            </div>
          </div>
          <LinkButton href="/dashboard/profile" variant="light" size="sm" className="self-start sm:self-center">
            <Pencil className="size-4" /> Edit profile
          </LinkButton>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
            <s.icon className="size-5 text-brand" />
            <p className="mt-3 font-display text-3xl font-semibold">{s.value ?? <Skeleton className="h-8 w-10" />}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Next on your wishlist</h2>
            <Link href="/dashboard/wishlist" className="text-sm font-semibold text-brand hover:underline">View all</Link>
          </div>
          {!upcoming ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : upcoming.length === 0 ? (
            <p className="rounded-2xl bg-canvas p-5 text-sm text-muted">
              Your wishlist is empty. <Link href="/destinations" className="font-semibold text-brand">Find places to visit →</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((w) => (
                <li key={w.destination.id}>
                  <Link href={`/destinations/${w.destination.slug}`} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-leaf-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sizedImage(w.destination.coverImage?.url, 330)} alt="" className="size-14 rounded-xl bg-leaf object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{w.destination.name}</p>
                      <p className="text-sm text-muted">{w.destination.district} · {w.destination.categoryLabel}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent reviews</h2>
            <Link href="/dashboard/reviews" className="text-sm font-semibold text-brand hover:underline">View all</Link>
          </div>
          {!reviews ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : reviews.length === 0 ? (
            <p className="rounded-2xl bg-canvas p-5 text-sm text-muted">You haven&apos;t written any reviews yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/destinations/${r.destination.slug}`} className="block truncate font-semibold hover:text-brand">{r.destination.name}</Link>
                    <p className="truncate text-sm text-muted">{r.comment}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function WelcomeToast() {
  const params = useSearchParams();
  const toast = useToast();
  useEffect(() => {
    if (params.get("welcome")) toast("Welcome to TravelSense! Your account is ready.");
  }, [params, toast]);
  return null;
}
