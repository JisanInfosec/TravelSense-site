"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { CircleCheck, Search } from "lucide-react";
import type { ModerationReview, Paginated, ReviewStatus } from "@/lib/types";
import { cn, STATUS_LABELS } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { ModerationCard } from "@/components/admin/moderation-list";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

const TABS: (ReviewStatus | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default function ReviewModerationPage() {
  const [status, setStatus] = useState<ReviewStatus | "ALL">("PENDING");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (status !== "ALL") params.set("status", status);
  if (debounced) params.set("q", debounced);
  const { data, error, mutate } = useSWR<Paginated<ModerationReview>>(`/moderation/reviews?${params}`, { keepPreviousData: true });
  const { data: summary, mutate: mutateSummary } = useSWR<Record<ReviewStatus, number>>("/moderation/reviews/summary");

  const refresh = () => {
    void mutate();
    void mutateSummary();
  };

  return (
    <>
      <PageTitle title="Review moderation" description="Approve or reject reviews before they appear publicly. Only approved reviews count towards ratings." />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
          {TABS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              aria-pressed={status === s}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                status === s ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-ink",
              )}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s]}
              {summary && s !== "ALL" && <span className="ml-1.5 opacity-70">{summary[s]}</span>}
            </button>
          ))}
        </div>
        <label className="relative md:w-72">
          <span className="sr-only">Search reviews</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search comment, place or reviewer"
            className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </label>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !data ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          title={status === "PENDING" && !debounced ? "No reviews waiting" : "No reviews found"}
          description={status === "PENDING" && !debounced ? "Every submitted review has been moderated." : "Try a different filter or search."}
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((r) => <ModerationCard key={r.id} r={r} onDone={refresh} />)}
          </div>
          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted">Page {page} of {data.totalPages}</span>
              <Button size="sm" variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
