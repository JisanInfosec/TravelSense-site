import { Suspense } from "react";
import { TouristShell } from "./tourist-shell";
import { Spinner } from "@/components/ui/states";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <TouristShell>{children}</TouristShell>
    </Suspense>
  );
}
