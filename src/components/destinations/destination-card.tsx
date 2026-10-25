import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import type { DestinationCard as Card } from "@/lib/types";
import { cn, sizedImage } from "@/lib/utils";
import { RatingPill } from "@/components/ui/stars";
import { Skeleton } from "@/components/ui/states";
import { CategoryIcon } from "./category-icon";

export function DestinationCard({ d, className, priority }: { d: Card; className?: string; priority?: boolean }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className={cn(
        "group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf">
        {d.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sizedImage(d.coverImage.url, 640)}
            alt={d.coverImage.caption ?? d.name}
            loading={priority ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center text-brand/40">
            <CategoryIcon category={d.category} className="size-12" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-brand-dark shadow-sm backdrop-blur">
            <CategoryIcon category={d.category} className="size-3.5" />
            {d.categoryLabel}
          </span>
          {d.distanceKm !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-dark/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <Navigation className="size-3" /> {d.distanceKm} km
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-ink group-hover:text-brand">{d.name}</h3>
          <RatingPill average={d.rating.average} count={d.rating.count} className="mt-0.5 shrink-0" />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 shrink-0 text-brand" /> {d.district}, {d.division}
        </p>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{d.shortDescription}</p>
        <span className="mt-auto pt-2 text-sm font-semibold text-brand">
          View details <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function DestinationGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6", className)}>{children}</div>;
}
