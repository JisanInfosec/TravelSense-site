"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Gem, Search, SearchX, X } from "lucide-react";
import type { CategoryOption, DestinationCard as Card, Paginated } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS, cn } from "@/lib/utils";
import { DestinationCard, DestinationCardSkeleton, DestinationGrid } from "@/components/destinations/destination-card";
import { CATEGORY_ICONS } from "@/components/destinations/category-icon";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name (A–Z)" },
  { value: "newest", label: "Newest" },
];
const LIMIT = 12;

export function Explore() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "popular";
  const hiddenGem = params.get("hiddenGem") === "true";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

  // Keep the input in sync when the URL changes (e.g. back button, "Clear filters").
  const [text, setText] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (syncedQ !== q) {
    setSyncedQ(q);
    setText(q);
  }

  const update = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    if (!("page" in next)) p.delete("page");
    router.replace(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false });
  };

  // Debounce typing into the URL so results update as the user types.
  useEffect(() => {
    if (text.trim() === q) return;
    const t = setTimeout(() => update({ q: text.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const apiParams = new URLSearchParams({ sort, page: String(page), limit: String(LIMIT) });
  if (q) apiParams.set("q", q);
  if (category) apiParams.set("category", category);
  if (hiddenGem) apiParams.set("hiddenGem", "true");
  const { data, error, isLoading, mutate } = useSWR<Paginated<Card>>(`/destinations?${apiParams}`, { keepPreviousData: true });
  const { data: categories } = useSWR<CategoryOption[]>("/destinations/categories");

  const hasFilters = Boolean(q || category || hiddenGem);
  const clear = () => {
    setText("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <>
      {/* Header + filters */}
      <section className="border-b border-line bg-surface">
        <div className="container-page pb-6 pt-10 sm:pt-14">
          <p className="eyebrow">Explore</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Explore destinations</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Search by name, district or division, and filter by category to find your next trip in Bangladesh.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search destinations</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand" />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="search"
                placeholder="Search e.g. “Sylhet”, “beach”, “fort”…"
                className="h-12 w-full rounded-full border border-line bg-canvas pl-12 pr-4 text-[15px] focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
              />
            </label>
            <div className="flex gap-3">
              <label className="flex-1 md:flex-none">
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => update({ sort: e.target.value === "popular" ? null : e.target.value })}
                  className="h-12 w-full cursor-pointer rounded-full border border-line bg-surface px-5 text-sm font-semibold focus:border-brand focus:outline-none md:w-48"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => update({ hiddenGem: hiddenGem ? null : "true" })}
                aria-pressed={hiddenGem}
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition",
                  hiddenGem ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand/40",
                )}
              >
                <Gem className="size-4" /> <span className="hidden sm:inline">Hidden gems</span>
              </button>
            </div>
          </div>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category filter">
            <Chip active={!category} onClick={() => update({ category: null })}>All</Chip>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              const count = categories?.find((x) => x.value === c)?.count;
              return (
                <Chip key={c} active={category === c} onClick={() => update({ category: category === c ? null : c })}>
                  <Icon className="size-4" /> {CATEGORY_LABELS[c]}
                  {count !== undefined && <span className="opacity-60">{count}</span>}
                </Chip>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container-page py-8 sm:py-10">
        <div className="mb-6 flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {data ? (
              <>
                <span className="font-semibold text-ink">{data.total}</span> {data.total === 1 ? "destination" : "destinations"}
                {q && <> matching “<span className="font-semibold text-ink">{q}</span>”</>}
                {category && <> in <span className="font-semibold text-ink">{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span></>}
              </>
            ) : (
              "Loading destinations…"
            )}
          </p>
          {hasFilters && (
            <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-brand hover:bg-leaf-soft">
              <X className="size-4" /> Clear filters
            </button>
          )}
        </div>

        {error ? (
          <ErrorState message={error.message} onRetry={() => mutate()} />
        ) : isLoading && !data ? (
          <DestinationGrid>{Array.from({ length: 6 }).map((_, i) => <DestinationCardSkeleton key={i} />)}</DestinationGrid>
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No destinations match your search"
            description="Try a different keyword, choose another category, or clear the filters to see every destination."
            action={hasFilters ? <Button onClick={clear}>Clear filters</Button> : undefined}
          />
        ) : data ? (
          <>
            <DestinationGrid className={cn("transition-opacity", isLoading && "opacity-60")}>
              {data.items.map((d, i) => <DestinationCard key={d.id} d={d} priority={i < 3} />)}
            </DestinationGrid>
            {data.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <span className="px-3 text-sm text-muted">
                  Page {page} of {data.totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => update({ page: String(page + 1) })}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </nav>
            )}
          </>
        ) : null}
      </section>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
        active ? "border-brand bg-brand text-white shadow-sm shadow-brand/20" : "border-line bg-surface text-ink hover:border-brand/40 hover:bg-leaf-soft",
      )}
    >
      {children}
    </button>
  );
}
