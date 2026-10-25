import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/states";

export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  tone = "green",
}: {
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "green" | "warn" | "danger" | "neutral";
}) {
  const toneCls = {
    green: "bg-leaf text-brand",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-canvas text-muted",
  }[tone];
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", toneCls)}>
          <Icon className="size-4.5" />
        </span>
      </div>
      {value === undefined ? (
        <Skeleton className="mt-3 h-9 w-16" />
      ) : (
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums sm:text-4xl">{value.toLocaleString()}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
