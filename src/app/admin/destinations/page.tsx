"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { ExternalLink, MapPinned, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { DestinationCard } from "@/lib/types";
import { formatDate, sizedImage } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { AdminOnly } from "@/components/admin/admin-only";
import { VerificationBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { RatingPill } from "@/components/ui/stars";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

export default function AdminDestinationsPage() {
  return (
    <AdminOnly>
      <DestinationsManager />
    </AdminOnly>
  );
}

function DestinationsManager() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const { data, error, mutate } = useSWR<DestinationCard[]>("/admin/destinations");
  const [toDelete, setToDelete] = useState<DestinationCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const shown = data?.filter((d) => `${d.name} ${d.district} ${d.categoryLabel}`.toLowerCase().includes(q.trim().toLowerCase()));

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/admin/destinations/${toDelete.id}`, { method: "DELETE" });
      toast(`${toDelete.name} was deleted.`);
      setToDelete(null);
      void mutate();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not delete destination.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Destinations"
        description="Add, edit and remove destinations, including photos, travel details, safety information and links."
        action={<LinkButton href="/admin/destinations/new"><Plus className="size-4" /> Add destination</LinkButton>}
      />
      <label className="relative mb-5 block">
        <span className="sr-only">Filter destinations</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name, district or category"
          className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 sm:max-w-sm"
        />
      </label>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !shown ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title={data?.length ? "No destinations match" : "No destinations yet"}
          action={!data?.length ? <LinkButton href="/admin/destinations/new">Add the first destination</LinkButton> : undefined}
        />
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {shown.map((d) => (
            <li key={d.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:px-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sizedImage(d.coverImage?.url, 330)} alt="" className="size-14 shrink-0 rounded-xl bg-leaf object-cover sm:size-16" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link href={`/admin/destinations/${d.id}`} className="truncate font-semibold hover:text-brand">{d.name}</Link>
                  <VerificationBadge verified={d.isVerified} className="hidden sm:inline-flex" />
                </div>
                <p className="truncate text-sm text-muted">{d.categoryLabel} · {d.district}, {d.division}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                  <RatingPill average={d.rating.average} count={d.rating.count} className="text-xs" />
                  <span>Updated {formatDate(d.updatedAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Link href={`/destinations/${d.slug}`} target="_blank" className="hidden size-9 place-items-center rounded-full text-muted hover:bg-leaf-soft hover:text-ink sm:grid" aria-label="View public page">
                  <ExternalLink className="size-4" />
                </Link>
                <Link href={`/admin/destinations/${d.id}`} className="grid size-9 place-items-center rounded-full text-muted hover:bg-leaf-soft hover:text-brand" aria-label={`Edit ${d.name}`}>
                  <Pencil className="size-4" />
                </Link>
                <button onClick={() => setToDelete(d)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${d.name}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete destination?"
        message={<>This permanently deletes <strong className="text-ink">{toDelete?.name}</strong> along with its photos, safety information, reviews and saved entries.</>}
        confirmLabel="Delete destination"
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
