import { CircleCheck, Clock3, ShieldAlert, XCircle } from "lucide-react";
import { cn, STATUS_LABELS } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/types";

type Tone = "green" | "neutral" | "warn" | "danger" | "info" | "glass";
const tones: Record<Tone, string> = {
  green: "bg-leaf text-brand-dark",
  neutral: "bg-canvas text-muted border border-line",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  glass: "bg-white/90 text-brand-dark backdrop-blur",
};

export function Badge({ tone = "green", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const map = {
    PENDING: { tone: "warn" as const, Icon: Clock3 },
    APPROVED: { tone: "green" as const, Icon: CircleCheck },
    REJECTED: { tone: "danger" as const, Icon: XCircle },
  }[status];
  return (
    <Badge tone={map.tone}>
      <map.Icon className="size-3.5" /> {STATUS_LABELS[status]}
    </Badge>
  );
}

/** Distinguishes demonstration content from information verified by the project owner. */
export function VerificationBadge({ verified, className }: { verified: boolean; className?: string }) {
  return verified ? (
    <Badge tone="green" className={className}>
      <CircleCheck className="size-3.5" /> Verified
    </Badge>
  ) : (
    <Badge tone="warn" className={className}>
      <ShieldAlert className="size-3.5" /> Demo content · unverified
    </Badge>
  );
}
