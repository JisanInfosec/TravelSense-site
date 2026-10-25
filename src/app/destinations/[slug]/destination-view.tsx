"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import {
  Ambulance,
  CalendarDays,
  CalendarCheck,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Heart,
  Info,
  MapPin,
  MapPinOff,
  Navigation,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Ticket,
  TriangleAlert,
  Plus,
  Check,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DestinationDetail, Facility } from "@/lib/types";
import { cn, formatDate, googleMapsDirections } from "@/lib/utils";
import { Gallery } from "@/components/destinations/gallery";
import { DestinationMap } from "@/components/destinations/map";
import { ReviewsSection } from "@/components/destinations/reviews";
import { DestinationCard } from "@/components/destinations/destination-card";
import { CategoryIcon } from "@/components/destinations/category-icon";
import { Badge, VerificationBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { RatingPill } from "@/components/ui/stars";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

const NA = "Information not available";

export function DestinationView() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  // Include the user id in the key so viewer-specific state refreshes after login/logout.
  const { data: d, error, mutate } = useSWR<DestinationDetail>([`/destinations/${slug}`, user?.id ?? "guest"], ([path]: [string]) =>
    api<DestinationDetail>(path),
  );

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="container-page py-20">
          <EmptyState
            icon={MapPinOff}
            title="Destination not found"
            description="This destination may have been removed or the link is incorrect."
            action={<LinkButton href="/destinations">Explore destinations</LinkButton>}
          />
        </div>
      );
    }
    return (
      <div className="container-page py-20">
        <ErrorState message={error.message} onRetry={() => mutate()} />
      </div>
    );
  }
  if (!d) return <DetailSkeleton />;

  const hasCoords = d.latitude !== null && d.longitude !== null;
  const hospitals = d.facilities.filter((f) => f.type === "HOSPITAL");
  const police = d.facilities.filter((f) => f.type === "POLICE_STATION");

  return (
    <article className="pb-16">
      <title>{`${d.name} · TravelSense`}</title>

      <div className="container-page pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="size-4" />
          <Link href="/destinations" className="hover:text-brand">Destinations</Link>
          <ChevronRight className="size-4" />
          <span className="truncate text-ink">{d.name}</span>
        </nav>

        <Gallery images={d.images} name={d.name} />

        {/* Title row */}
        <header className="mt-6 flex flex-col gap-5 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <CategoryIcon category={d.category} className="size-3.5" /> {d.categoryLabel}
              </Badge>
              {d.isHiddenGem && <Badge tone="info">Hidden gem</Badge>}
              <VerificationBadge verified={d.isVerified} />
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{d.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-brand" /> {d.district}, {d.division} Division
              </span>
              <a href="#reviews" className="hover:underline">
                <RatingPill average={d.rating.average} count={d.rating.count} />
              </a>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Last updated {formatDate(d.updatedAt)}
              </span>
            </div>
          </div>
          <SaveActions d={d} onChanged={() => mutate()} />
        </header>

        {!d.isVerified && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-warn/20 bg-warn-soft px-4 py-3 text-sm text-warn">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Demonstration content.</strong> The details on this page have not been verified by the TravelSense team yet.
              Please confirm opening hours, fees and contacts with official sources before travelling.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          {/* Main column */}
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="text-2xl font-semibold">About {d.name}</h2>
              <p className="mt-4 whitespace-pre-line text-[1.05rem] leading-[1.8] text-ink/85">{d.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Plan your visit</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoTile icon={Clock} label="Opening hours" value={d.openingHours} />
                <InfoTile icon={Ticket} label="Entry fee" value={d.entryFee} />
                <InfoTile icon={CalendarCheck} label="Best time to visit" value={d.bestTimeToVisit} />
                <InfoTile icon={MapPin} label="Address" value={d.address} />
              </div>
            </section>

            <section id="safety" className="scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-semibold">Safety information</h2>
                {d.safety && <VerificationBadge verified={!!d.safety.isVerified} />}
              </div>
              {d.safety && (d.safety.tips.length || d.safety.warnings.length) ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-surface p-5">
                    <h3 className="flex items-center gap-2 font-sans text-base font-bold text-brand-dark">
                      <ShieldCheck className="size-5 text-brand" /> Safety tips
                    </h3>
                    {d.safety.tips.length ? (
                      <ul className="mt-3 space-y-2.5">
                        {d.safety.tips.map((t, i) => (
                          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" /> {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted">{NA}</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-warn/20 bg-warn-soft/60 p-5">
                    <h3 className="flex items-center gap-2 font-sans text-base font-bold text-warn">
                      <TriangleAlert className="size-5" /> Warnings
                    </h3>
                    {d.safety.warnings.length ? (
                      <ul className="mt-3 space-y-2.5">
                        {d.safety.warnings.map((t, i) => (
                          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warn" /> {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted">No specific warnings recorded.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
                  Safety information is not available for this destination yet.
                </p>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FacilityList title="Nearby hospitals" icon={Ambulance} items={hospitals} />
                <FacilityList title="Nearby police stations" icon={ShieldAlert} items={police} />
              </div>

              <div className="mt-4 rounded-2xl bg-brand-dark p-5 text-white">
                <h3 className="flex items-center gap-2 font-sans text-base font-bold">
                  <Siren className="size-5 text-leaf" /> Emergency contacts
                </h3>
                {d.emergencyContacts.length ? (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {d.emergencyContacts.map((c, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white/80">{c.label}</p>
                          {!c.isVerified && <p className="text-[11px] text-white/50">Unverified</p>}
                        </div>
                        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-brand-dark">
                          <Phone className="size-3.5" /> {c.phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-white/70">{NA}</p>
                )}
              </div>
            </section>

            <ReviewsSection d={d} onChanged={() => mutate()} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              {hasCoords ? (
                <>
                  <DestinationMap lat={d.latitude!} lng={d.longitude!} label={d.name} className="h-64 w-full" />
                  <div className="space-y-3 p-5">
                    <p className="text-xs text-muted">
                      Coordinates: {d.latitude!.toFixed(4)}, {d.longitude!.toFixed(4)}
                      {!d.isVerified && " (approximate)"}
                    </p>
                    <a
                      href={googleMapsDirections(d.latitude!, d.longitude!)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      <Navigation className="size-4" /> Navigate with Google Maps
                    </a>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <MapPinOff className="mx-auto size-8 text-muted" />
                  <p className="mt-2 font-semibold">Location not available</p>
                  <p className="mt-1 text-sm text-muted">Map and navigation will appear once coordinates are added.</p>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-muted">Official links</h3>
              <ul className="mt-3 space-y-2">
                <LinkRow icon={Globe} label={d.links?.websiteLabel ?? "Official website"} href={d.links?.website} />
                <LinkRow icon={FacebookIcon} label="Facebook" href={d.links?.facebook} />
                <LinkRow icon={YoutubeIcon} label="YouTube" href={d.links?.youtube} />
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {d.nearby.length > 0 && (
        <section className="container-page mt-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">Nearby destinations</h2>
          <p className="mt-1 text-sm text-muted">Other places within about 80 km.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {d.nearby.map((n) => <DestinationCard key={n.id} d={n} />)}
          </div>
        </section>
      )}
    </article>
  );
}

function SaveActions({ d, onChanged }: { d: DestinationDetail; onChanged: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<"fav" | "wish" | null>(null);
  const fav = d.viewer?.isFavorite ?? false;
  const wish = d.viewer?.wishlist ?? null;

  const guard = () => {
    if (!user) {
      router.push(`/login?next=/destinations/${d.slug}`);
      return false;
    }
    if (user.role !== "TOURIST") {
      toast("Favourites and wishlists are available for tourist accounts.", "error");
      return false;
    }
    return true;
  };

  const toggle = async (kind: "fav" | "wish") => {
    if (!guard()) return;
    setBusy(kind);
    try {
      if (kind === "fav") {
        await api(`/me/favorites/${d.id}`, { method: fav ? "DELETE" : "PUT" });
        toast(fav ? "Removed from favourites." : "Saved to favourites.");
      } else {
        await api(`/me/wishlist/${d.id}`, { method: wish ? "DELETE" : "PUT" });
        toast(wish ? "Removed from your wishlist." : "Added to your travel wishlist.");
      }
      onChanged();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Something went wrong.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex shrink-0 gap-2">
      <Button
        variant="secondary"
        onClick={() => toggle("fav")}
        loading={busy === "fav"}
        aria-pressed={fav}
        className={cn(fav && "border-danger/30 bg-danger-soft text-danger hover:bg-danger-soft")}
      >
        {busy !== "fav" && <Heart className="size-4" fill={fav ? "currentColor" : "none"} />}
        {fav ? "Saved" : "Favourite"}
      </Button>
      <Button variant={wish ? "secondary" : "primary"} onClick={() => toggle("wish")} loading={busy === "wish"} aria-pressed={!!wish}>
        {busy !== "wish" && (wish ? <Check className="size-4" /> : <Plus className="size-4" />)}
        {wish ? (wish.visited ? "Visited" : "In wishlist") : "Add to wishlist"}
      </Button>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf text-brand">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className={cn("mt-1 text-[15px] leading-snug", value ? "text-ink" : "italic text-muted")}>{value ?? NA}</p>
      </div>
    </div>
  );
}

function FacilityList({ title, icon: Icon, items }: { title: string; icon: React.ComponentType<{ className?: string }>; items: Facility[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="flex items-center gap-2 font-sans text-base font-bold text-ink">
        <Icon className="size-5 text-brand" /> {title}
      </h3>
      {items.length ? (
        <ul className="mt-3 divide-y divide-line">
          {items.map((f, i) => (
            <li key={i} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-snug">{f.name}</p>
                {!f.isVerified && <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">Unverified</span>}
              </div>
              <p className="mt-0.5 text-sm text-muted">{f.address ?? "Address not available"}</p>
              {f.phone ? (
                <a href={`tel:${f.phone.replace(/\s/g, "")}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <Phone className="size-3.5" /> {f.phone}
                </a>
              ) : (
                <p className="mt-1 text-xs italic text-muted">Phone number not available</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm italic text-muted">{NA}</p>
      )}
    </div>
  );
}

function LinkRow({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href?: string | null }) {
  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-leaf-soft">
          <Icon className="size-4 text-brand" />
          <span className="flex-1">{label}</span>
          <ExternalLink className="size-3.5 text-muted" />
        </a>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted">
          <Icon className="size-4 opacity-50" />
          <span className="flex-1">{label}</span>
          <span className="text-xs italic">Not available</span>
        </div>
      )}
    </li>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page pt-8">
      <Skeleton className="mb-4 h-4 w-60" />
      <Skeleton className="aspect-[4/3] rounded-3xl md:aspect-auto md:h-[30rem]" />
      <Skeleton className="mt-8 h-10 w-2/3 max-w-lg" />
      <Skeleton className="mt-3 h-4 w-1/3" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}
