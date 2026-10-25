"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { MessageSquareText } from "lucide-react";
import type { OwnReview, ReviewStatus } from "@/lib/types";
import { cn, formatDate, sizedImage, STATUS_LABELS } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

const HELP: Record<ReviewStatus, string> = {
  PENDING: "Waiting for a moderator. Not visible publicly yet.",
  APPROVED: "Visible on the destination page and counted in its rating.",
  REJECTED: "Not published. You can edit and resubmit it from the destination page.",
};

export default function MyReviewsPage() {
  const { data, error, mutate } = useSWR<OwnReview[]>("/reviews/mine");
  const [filter, setFilter] = useState<ReviewStatus | "ALL">("ALL");
  const shown = data?.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <>
      <PageTitle title="My reviews" description="Track the moderation status of reviews you've submitted." />
      <div className="mb-5 flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              filter === s ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s]}{" "}
            <span className="opacity-70">{data ? (s === "ALL" ? data.length : data.filter((r) => r.status === s).length) : ""}</span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !shown ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title={filter === "ALL" ? "You haven't written any reviews yet" : `No ${STATUS_LABELS[filter].toLowerCase()} reviews`}
          description={filter === "ALL" ? "Visited a destination? Share your experience from its details page." : undefined}
          action={filter === "ALL" ? <LinkButton href="/destinations">Find a destination</LinkButton> : undefined}
        />
      ) : (
        <ul className="space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sizedImage(r.destination.images[0]?.url, 330)} alt="" className="h-32 w-full rounded-xl bg-leaf object-cover sm:size-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/destinations/${r.destination.slug}#reviews`} className="text-lg font-semibold hover:text-brand">
                        {r.destination.name}
                      </Link>
                      <p className="text-xs text-muted">
                        Submitted {formatDate(r.createdAt)}
                        {r.updatedAt !== r.createdAt && ` · Updated ${formatDate(r.updatedAt)}`}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <Stars value={r.rating} className="mt-2" />
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/85">{r.comment}</p>
                  <p className="mt-3 text-xs text-muted">{HELP[r.status]}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
