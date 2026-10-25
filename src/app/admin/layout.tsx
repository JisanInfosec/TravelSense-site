import { Suspense } from "react";
import { Spinner } from "@/components/ui/states";
import { AdminShell } from "./admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
