"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Circle, Map, MapPin, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { WishlistEntry } from "@/lib/types";
import { cn, formatDate, sizedImage } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { RatingPill } from "@/components/ui/stars";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

type Filter = "all" | "todo" | "visited";

export default function WishlistPage() {
  const { data, error, mutate } = useSWR<WishlistEntry[]>("/me/wishlist");
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<WishlistEntry | null>(null);

  const setVisited = async (w: WishlistEntry) => {
    setBusy(w.destination.id);
    try {
      const res = await api<{ visited: boolean; visitedAt: string | null }>(`/me/wishlist/${w.destination.id}`, {
        method: "PATCH",
        body: { visited: !w.visited },
      });
      await mutate((items) => items?.map((x) => (x.destination.id === w.destination.id ? { ...x, ...res } : x)), { revalidate: false });
      toast(res.visited ? `Marked ${w.destination.name} as visited. Why not leave a review?` : "Marked as not visited yet.");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update wishlist.", "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!toRemove) return;
    const id = toRemove.destination.id;
    setBusy(id);
    try {
      await api(`/me/wishlist/${id}`, { method: "DELETE" });
      await mutate((items) => items?.filter((x) => x.destination.id !== id), { revalidate: false });
      toast("Removed from your wishlist.");
      setToRemove(null);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not remove destination.", "error");
    } finally {
      setBusy(null);
    }
  };

  const counts = { all: data?.length ?? 0, todo: data?.filter((w) => !w.visited).length ?? 0, visited: data?.filter((w) => w.visited).length ?? 0 };
  const shown = data?.filter((w) => (filter === "all" ? true : filter === "visited" ? w.visited : !w.visited));

  return (
    <>
      <PageTitle title="Travel wishlist" description="Places you plan to visit. Mark them as visited once you've been." />
      <div className="mb-5 inline-flex rounded-full border border-line bg-surface p-1" role="tablist">
        {([
          ["all", "All"],
          ["todo", "To visit"],
          ["visited", "Visited"],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", filter === k ? "bg-brand text-white" : "text-muted hover:text-ink")}
          >
            {label} <span className="opacity-70">{counts[k]}</span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !shown ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Map}
          title={filter === "visited" ? "No visited places yet" : filter === "todo" ? "Nothing left to visit" : "Your wishlist is empty"}
          description={filter === "all" ? "Add destinations to your wishlist from their details page." : undefined}
          action={filter === "all" ? <LinkButton href="/destinations">Find destinations</LinkButton> : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((w) => {
            const d = w.destination;
            return (
              <li key={d.id} className={cn("card flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4", w.visited && "bg-leaf-soft/50")}>
                <Link href={`/destinations/${d.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sizedImage(d.coverImage?.url, 330)} alt="" className="size-20 shrink-0 rounded-xl bg-leaf object-cover sm:size-24" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">{d.categoryLabel}</p>
                    <p className="truncate text-lg font-semibold">{d.name}</p>
                    <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5" /> {d.district}, {d.division}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                      <RatingPill average={d.rating.average} count={d.rating.count} className="text-xs" />
                      <span>{w.visited && w.visitedAt ? `Visited ${formatDate(w.visitedAt)}` : `Added ${formatDate(w.addedAt)}`}</span>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 sm:shrink-0">
                  <Button
                    size="sm"
                    variant={w.visited ? "primary" : "secondary"}
                    onClick={() => setVisited(w)}
                    loading={busy === d.id}
                    className="flex-1 sm:flex-none"
                    aria-pressed={w.visited}
                  >
                    {busy !== d.id && (w.visited ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />)}
                    {w.visited ? "Visited" : "Mark visited"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-soft" onClick={() => setToRemove(w)} aria-label={`Remove ${d.name}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!toRemove}
        title="Remove from wishlist?"
        message={<>Remove <strong className="text-ink">{toRemove?.destination.name}</strong> from your travel wishlist?</>}
        confirmLabel="Remove"
        danger
        loading={!!toRemove && busy === toRemove.destination.id}
        onConfirm={remove}
        onClose={() => setToRemove(null)}
      />
    </>
  );
}
