import { Compass } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 items-center justify-center py-24">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-leaf text-brand">
          <Compass className="size-8" />
        </div>
        <p className="mt-6 font-display text-6xl font-semibold text-brand">404</p>
        <h1 className="mt-2 text-2xl font-semibold">This page went off the map</h1>
        <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/">Back home</LinkButton>
          <LinkButton href="/destinations" variant="secondary">Explore destinations</LinkButton>
        </div>
      </div>
    </div>
  );
}
