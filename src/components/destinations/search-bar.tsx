"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS, cn } from "@/lib/utils";

/** Hero search: keyword + optional category, submits to the Explore page. */
export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    router.push(`/destinations${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:rounded-full",
        className,
      )}
    >
      <label className="flex flex-1 items-center gap-3 px-4 py-2 sm:py-0">
        <Search className="size-5 shrink-0 text-brand" />
        <span className="sr-only">Search destinations</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a place, district or division…"
          className="h-10 w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />
      </label>
      <div className="hidden h-8 w-px bg-line sm:block" />
      <label className="px-4 sm:px-2">
        <span className="sr-only">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full cursor-pointer bg-transparent text-sm font-medium text-ink focus:outline-none sm:w-44"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Search
      </button>
    </form>
  );
}
