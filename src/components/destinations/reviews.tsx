"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquareText, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DestinationDetail, MyReview, Paginated, PublicReview } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/layout/navbar";
import { Button, LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, FormError, Textarea } from "@/components/ui/form";
import { StarInput, Stars } from "@/components/ui/stars";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

export function ReviewsSection({ d, onChanged }: { d: DestinationDetail; onChanged: () => void }) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useSWR<Paginated<PublicReview>>(`/destinations/${d.id}/reviews?page=${page}&limit=5`, {
    keepPreviousData: true,
  });

  return (
    <section id="reviews" className="scroll-mt-24">
      <h2 className="text-2xl font-semibold">Reviews &amp; ratings</h2>
      <p className="mt-1 text-sm text-muted">Only reviews approved by our moderators are shown and counted in the rating.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <RatingSummaryCard rating={d.rating} />
        <ReviewComposer d={d} onChanged={() => { onChanged(); void mutate(); }} />
      </div>

      <div className="mt-8 space-y-4">
        {error ? (
          <ErrorState message={error.message} onRetry={() => mutate()} />
        ) : isLoading && !data ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : data && data.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center">
            <MessageSquareText className="mx-auto mb-2 size-7 text-brand/60" />
            <p className="font-semibold">No approved reviews yet</p>
            <p className="mt-1 text-sm text-muted">Visited this place? Share your experience to help other travellers.</p>
          </div>
        ) : (
          data?.items.map((r) => (
            <article key={r.id} className="rounded-2xl border border-line bg-surface p-5">
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={r.user.name} url={r.user.avatarUrl} />
                  <div>
                    <p className="font-semibold leading-tight">{r.user.name}</p>
                    <time className="text-xs text-muted" dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                  </div>
                </div>
                <Stars value={r.rating} />
              </header>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{r.comment}</p>
            </article>
          ))
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Newer</Button>
            <span className="text-sm text-muted">Page {page} of {data.totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Older</Button>
          </div>
        )}
      </div>
    </section>
  );
}

function RatingSummaryCard({ rating }: { rating: DestinationDetail["rating"] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-end gap-2">
        <span className="font-display text-5xl font-semibold leading-none">{rating.average?.toFixed(1) ?? "–"}</span>
        <span className="pb-1 text-sm text-muted">/ 5</span>
      </div>
      <Stars value={rating.average ?? 0} size="md" className="mt-2" />
      <p className="mt-1 text-sm text-muted">
        {rating.count ? `Based on ${rating.count} approved review${rating.count > 1 ? "s" : ""}` : "No ratings yet"}
      </p>
      <div className="mt-4 space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = rating.distribution[n] ?? 0;
          const pct = rating.count ? (c / rating.count) * 100 : 0;
          return (
            <div key={n} className="flex items-center gap-2 text-xs text-muted">
              <span className="w-3 text-right">{n}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-5 text-right">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewComposer({ d, onChanged }: { d: DestinationDetail; onChanged: () => void }) {
  const { user, loading } = useAuth();
  const toast = useToast();
  const existing = d.viewer?.review ?? null;
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <Skeleton className="h-48 rounded-2xl" />;

  if (!user) {
    return (
      <Panel>
        <h3 className="text-lg font-semibold">Share your experience</h3>
        <p className="mt-1 text-sm text-muted">Log in or create a free account to rate this destination and write a review.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/login?next=/destinations/${d.slug}%23reviews`}>Log in to review</LinkButton>
          <LinkButton href="/register" variant="secondary">Create account</LinkButton>
        </div>
      </Panel>
    );
  }

  if (user.role !== "TOURIST") {
    return (
      <Panel>
        <h3 className="text-lg font-semibold">Reviews are written by tourists</h3>
        <p className="mt-1 text-sm text-muted">Staff accounts moderate reviews but cannot submit them.</p>
        <LinkButton href="/admin/reviews" variant="secondary" className="mt-4">Go to review moderation</LinkButton>
      </Panel>
    );
  }

  if (existing && !editing) {
    const remove = async () => {
      setDeleting(true);
      try {
        await api(`/reviews/${existing.id}`, { method: "DELETE" });
        toast("Your review was deleted.");
        setConfirmDelete(false);
        onChanged();
      } catch (e) {
        toast(e instanceof ApiError ? e.message : "Could not delete review.", "error");
      } finally {
        setDeleting(false);
      }
    };
    return (
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Your review</h3>
          <StatusBadge status={existing.status} />
        </div>
        <Stars value={existing.rating} size="md" className="mt-3" />
        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-ink/90">{existing.comment}</p>
        <p className="mt-3 text-xs text-muted">
          {existing.status === "PENDING" && "Waiting for moderation. It will appear publicly once approved."}
          {existing.status === "APPROVED" && "Approved and visible to everyone."}
          {existing.status === "REJECTED" && "This review was not approved. You can edit it and resubmit for moderation."}
        </p>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit</Button>
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-soft" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
        <ConfirmDialog
          open={confirmDelete}
          title="Delete your review?"
          message="This permanently removes your rating and comment for this destination."
          confirmLabel="Delete review"
          danger
          loading={deleting}
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      </Panel>
    );
  }

  return (
    <ReviewForm
      destinationId={d.id}
      existing={existing}
      onCancel={existing ? () => setEditing(false) : undefined}
      onSaved={() => {
        setEditing(false);
        onChanged();
      }}
    />
  );
}

export function ReviewForm({
  destinationId,
  existing,
  onSaved,
  onCancel,
}: {
  destinationId: string;
  existing: MyReview | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const toast = useToast();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    if (comment.trim().length < 10) return setError("Please write at least 10 characters.");
    setError(null);
    setSaving(true);
    try {
      if (existing) await api(`/reviews/${existing.id}`, { method: "PATCH", body: { rating, comment } });
      else await api(`/destinations/${destinationId}/reviews`, { method: "POST", body: { rating, comment } });
      toast(existing ? "Review updated and sent for moderation." : "Thanks! Your review was submitted and is pending moderation.");
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not submit review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="text-lg font-semibold">{existing ? "Edit your review" : "Write a review"}</h3>
      <p className="mt-1 text-sm text-muted">New and edited reviews are checked by a moderator before they appear.</p>
      <div className="mt-4 space-y-4">
        <StarInput value={rating} onChange={setRating} />
        <Field label="Your review" htmlFor="review-comment" hint={`${comment.trim().length}/2000 characters`}>
          <Textarea
            id="review-comment"
            value={comment}
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you enjoy? Any tips for other travellers?"
          />
        </Field>
        <FormError message={error} />
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>{existing ? "Save & resubmit" : "Submit review"}</Button>
          {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        </div>
      </div>
    </form>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-surface p-5">{children}</div>;
}

