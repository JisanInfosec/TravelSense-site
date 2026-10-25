import { Suspense } from "react";
import { Spinner } from "@/components/ui/states";
import { DestinationView } from "./destination-view";

export default function DestinationPage() {
  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <DestinationView />
    </Suspense>
  );
}
