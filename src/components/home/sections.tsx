"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import type { CategoryOption, DestinationCard as Card, Paginated } from "@/lib/types";
import { sizedImage } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { DestinationCard, DestinationCardSkeleton, DestinationGrid } from "@/components/destinations/destination-card";
import { CATEGORY_ICONS } from "@/components/destinations/category-icon";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { RatingPill } from "@/components/ui/stars";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  light,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className={light ? "eyebrow text-leaf" : "eyebrow"}>{eyebrow}</p>
        <h2 className={`mt-2 text-3xl font-semibold sm:text-4xl ${light ? "text-white" : "text-ink"}`}>{title}</h2>
        {description && <p className={`mt-3 text-base leading-relaxed ${light ? "text-white/75" : "text-muted"}`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PopularDestinations() {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Card>>("/destinations?sort=popular&limit=6");
  return (
    <section className="container-page py-16 sm:py-24">
      <SectionHeading
        eyebrow="Popular right now"
        title="Places travellers love"
        description="The destinations TravelSense users save and review most."
        action={
          <LinkButton href="/destinations" variant="secondary" className="self-start sm:self-auto">
            View all destinations <ArrowRight className="size-4" />
          </LinkButton>
        }
      />
      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !data ? (
        <DestinationGrid>
          {Array.from({ length: 6 }).map((_, i) => <DestinationCardSkeleton key={i} />)}
        </DestinationGrid>
      ) : data.items.length === 0 ? (
        <EmptyState icon={Compass} title="No destinations yet" description="Destinations added by administrators will appear here." />
      ) : (
        <DestinationGrid>
          {data.items.map((d, i) => <DestinationCard key={d.id} d={d} priority={i < 3} />)}
        </DestinationGrid>
      )}
    </section>
  );
}

export function CategoryTiles() {
  const { data, error, mutate } = useSWR<CategoryOption[]>("/destinations/categories");
  return (
    <section className="border-y border-line bg-surface">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Browse by category"
          title="What kind of trip are you planning?"
          description="From the Bay of Bengal to the Chittagong Hill Tracts, filter destinations by what you enjoy."
        />
        {error ? (
          <ErrorState message={error.message} onRetry={() => mutate()} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {(data ?? Array.from({ length: 8 }, () => null)).map((c, i) =>
              c ? (
                <Link
                  key={c.value}
                  href={`/destinations?category=${c.value}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-canvas/60 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-leaf-soft hover:shadow-card sm:p-5"
                >
                  <CategoryTileIcon category={c.value} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight text-ink sm:text-[15px]">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {c.count} {c.count === 1 ? "place" : "places"}
                    </p>
                  </div>
                </Link>
              ) : (
                <Skeleton key={i} className="h-[76px] rounded-2xl" />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryTileIcon({ category }: { category: CategoryOption["value"] }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf text-brand transition-colors group-hover:bg-brand group-hover:text-white">
      <Icon className="size-5" />
    </span>
  );
}

export function HiddenGems() {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Card>>("/destinations?hiddenGem=true&sort=rating&limit=5");
  const items = data?.items ?? [];
  return (
    <section id="hidden-gems" className="relative overflow-hidden bg-brand-dark py-16 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand/40 blur-3xl" />
      <div className="container-page relative">
        <SectionHeading
          light
          eyebrow="Off the beaten path"
          title="Lesser-known destinations"
          description="Quieter places that deserve more visitors, from terracotta temples to swamp forests."
          action={
            <LinkButton href="/destinations?hiddenGem=true" variant="light" className="self-start sm:self-auto">
              See all hidden gems <ArrowRight className="size-4" />
            </LinkButton>
          }
        />
        {error ? (
          <ErrorState message={error.message} onRetry={() => mutate()} />
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            <Skeleton className="h-80 bg-white/10 md:col-span-2 md:row-span-2 md:h-auto" />
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 bg-white/10" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-white/70">No lesser-known destinations have been added yet.</p>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none md:mx-0 md:grid md:auto-rows-[15rem] md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
            {items.map((d, i) => (
              <Link
                key={d.id}
                href={`/destinations/${d.slug}`}
                className={`group relative h-80 w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl bg-brand md:h-auto md:w-auto ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                {d.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sizedImage(d.coverImage.url, i === 0 ? 1280 : 640)}
                    alt={d.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-leaf">{d.categoryLabel}</p>
                  <h3 className={`font-semibold text-white ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>{d.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {d.district}
                    </span>
                    <RatingPill average={d.rating.average} count={d.rating.count} className="text-white [&_span]:text-white/70" />
                  </div>
                  {i === 0 && <p className="mt-3 hidden max-w-md text-sm text-white/80 sm:block">{d.shortDescription}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PlanCta() {
  const { user } = useAuth();
  const tourist = user?.role === "TOURIST";
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-leaf px-6 py-12 sm:px-12 sm:py-16">
        <div aria-hidden className="absolute -bottom-24 -right-16 size-72 rounded-full bg-brand/10" />
        <div aria-hidden className="absolute -top-20 right-40 size-40 rounded-full bg-white/50" />
        <div className="relative max-w-2xl">
          <p className="eyebrow">Plan your next trip</p>
          <h2 className="mt-2 text-3xl font-semibold text-brand-dark sm:text-4xl">
            {tourist ? `Welcome back, ${user.name.split(" ")[0]}.` : "Save places, build a wishlist, share your experience."}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-dark/75">
            {tourist
              ? "Pick up where you left off: check your wishlist, mark places as visited and review the destinations you've been to."
              : "Create a free account to save favourite destinations, keep a travel wishlist, mark places as visited and post reviews."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {tourist ? (
              <>
                <LinkButton href="/dashboard/wishlist" size="lg">Open my wishlist</LinkButton>
                <LinkButton href="/destinations" size="lg" variant="secondary">Explore more</LinkButton>
              </>
            ) : user ? (
              <LinkButton href="/admin" size="lg">Go to dashboard</LinkButton>
            ) : (
              <>
                <LinkButton href="/register" size="lg">Create free account</LinkButton>
                <LinkButton href="/destinations" size="lg" variant="secondary">Browse first</LinkButton>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
