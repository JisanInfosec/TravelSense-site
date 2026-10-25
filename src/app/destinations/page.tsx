import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/states";
import { Explore } from "./explore";

export const metadata: Metadata = {
  title: "Explore destinations",
  description: "Search and filter tourist destinations across Bangladesh by category.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <Explore />
    </Suspense>
  );
}
