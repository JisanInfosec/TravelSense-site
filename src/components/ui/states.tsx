import { CircleAlert, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-line/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-leaf text-brand">
        <Icon className="size-6" />
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn("card flex flex-col items-center px-6 py-12 text-center", className)} role="alert">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger">
        <CircleAlert className="size-6" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-leaf-soft"
        >
          <RotateCw className="size-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-16", className)}>
      <div className="size-8 animate-spin rounded-full border-[3px] border-leaf border-t-brand" />
    </div>
  );
}
