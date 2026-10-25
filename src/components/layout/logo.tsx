import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path d="M16 6.5c-4.9 0-8.5 3.7-8.5 8.3 0 5.8 8.5 11.7 8.5 11.7s8.5-5.9 8.5-11.7c0-4.6-3.6-8.3-8.5-8.3Z" fill="#fff" />
      <path d="M16 20.5c0-4.3 1.6-7.1 4.6-8.8-3.9.2-6.6 2.4-7.4 5.6-.6-1.5-1.8-2.6-3.6-3.2 1.9 1.6 2.9 3.7 2.9 6.4H16Z" fill="currentColor" opacity=".9" />
    </svg>
  );
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="TravelSense home">
      <LogoMark className={light ? "text-white [&_path:first-of-type]:fill-brand-dark" : "text-brand"} />
      <span className={cn("font-display text-[1.35rem] font-semibold tracking-tight", light ? "text-white" : "text-brand-dark")}>
        Travel<span className={light ? "text-leaf" : "text-brand"}>Sense</span>
      </span>
    </Link>
  );
}
