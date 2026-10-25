"use client";

import { useState } from "react";
import useSWR from "swr";
import { Heart, HeartOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { FavoriteItem } from "@/lib/types";
import { DestinationCard, DestinationCardSkeleton } from "@/components/destinations/destination-card";
import { PageTitle } from "@/components/dashboard/side-nav";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

export default function FavoritesPage() {
  const { data, error, mutate } = useSWR<FavoriteItem[]>("/me/favorites");
  const toast = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  const remove = async (id: string, name: string) => {
    setRemoving(id);
    try {
      await api(`/me/favorites/${id}`, { method: "DELETE" });
      await mutate((items) => items?.filter((f) => f.destination.id !== id), { revalidate: false });
      toast(`${name} removed from favourites.`);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not remove favourite.", "error");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <>
      <PageTitle title="Favourite places" description="Destinations you've saved for inspiration." />
      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !data ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <DestinationCardSkeleton key={i} />)}</div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Tap “Favourite” on any destination page to save it here."
          action={<LinkButton href="/destinations">Explore destinations</LinkButton>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.map(({ destination: d }) => (
            <div key={d.id} className="relative">
              <DestinationCard d={d} />
              <button
                onClick={() => remove(d.id, d.name)}
                disabled={removing === d.id}
                className="absolute right-3 top-12 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-danger shadow-sm backdrop-blur transition hover:bg-danger-soft disabled:opacity-60"
                aria-label={`Remove ${d.name} from favourites`}
              >
                <HeartOff className="size-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
