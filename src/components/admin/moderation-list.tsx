"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ModerationReview } from "@/lib/types";
import { formatDate, sizedImage } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { useToast } from "@/components/ui/toast";

export function ModerationCard({ r, onDone }: { r: ModerationReview; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState<"APPROVED" | "REJECTED" | null>(null);

  const moderate = async (status: "APPROVED" | "REJECTED") => {
    setBusy(status);
    try {
      await api(`/moderation/reviews/${r.id}`, { method: "PATCH", body: { status } });
      toast(status === "APPROVED" ? "Review approved and published." : "Review rejected.");
      onDone();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update review.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href={`/destinations/${r.destination.slug}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sizedImage(r.destination.images[0]?.url, 330)} alt="" className="h-28 w-full rounded-xl bg-leaf object-cover sm:size-20" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/destinations/${r.destination.slug}`} className="font-semibold hover:text-brand">{r.destination.name}</Link>
              <p className="text-xs text-muted">
                by <span className="font-semibold text-ink">{r.user.name}</span> ({r.user.email}) · {formatDate(r.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <Stars value={r.rating} className="mt-2" />
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/90">{r.comment}</p>
          {r.moderatedAt && (
            <p className="mt-2 text-xs text-muted">
              Moderated {formatDate(r.moderatedAt)}{r.moderatedBy && ` by ${r.moderatedBy.name}`}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {r.status !== "APPROVED" && (
              <Button size="sm" onClick={() => moderate("APPROVED")} loading={busy === "APPROVED"} disabled={!!busy}>
                {busy !== "APPROVED" && <Check className="size-4" />} Approve
              </Button>
            )}
            {r.status !== "REJECTED" && (
              <Button size="sm" variant="secondary" className="text-danger" onClick={() => moderate("REJECTED")} loading={busy === "REJECTED"} disabled={!!busy}>
                {busy !== "REJECTED" && <X className="size-4" />} Reject
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
