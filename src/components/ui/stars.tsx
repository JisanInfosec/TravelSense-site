"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const px = { sm: "size-3.5", md: "size-4.5", lg: "size-6" }[size];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn("relative", px)}>
            <Star className={cn("absolute inset-0 text-line", px)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("text-gold", px)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Rating" className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={cn("size-8", i <= shown ? "text-gold" : "text-line")} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-muted">{LABELS[shown] ?? ""}</span>
    </div>
  );
}

export function RatingPill({ average, count, className }: { average: number | null; count: number; className?: string }) {
  if (average === null) return <span className={cn("text-xs text-muted", className)}>No reviews yet</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold text-ink", className)}>
      <Star className="size-4 text-gold" fill="currentColor" strokeWidth={0} />
      {average.toFixed(1)}
      <span className="font-normal text-muted">({count})</span>
    </span>
  );
}
