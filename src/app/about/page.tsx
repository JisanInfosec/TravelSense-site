import type { Metadata } from "next";
import { BadgeCheck, Compass, HeartHandshake, MapPinned, MessageSquareText, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "TravelSense brings together destination information, safety details and trip planning for Bangladesh.",
};

const IMG = "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Paharpur_Buddhist_Bihar.jpg/1280px-Paharpur_Buddhist_Bihar.jpg";

const FEATURES = [
  { icon: Compass, title: "Discover", text: "Search destinations by name or region, and filter by beaches, hills, waterfalls, forests, heritage sites and more." },
  { icon: MapPinned, title: "Navigate", text: "Each destination has an interactive map and a one-tap link to Google Maps directions." },
  { icon: ShieldCheck, title: "Stay safe", text: "Safety tips, warnings, nearby hospitals and police stations, and emergency numbers, all on one page." },
  { icon: MessageSquareText, title: "Trusted reviews", text: "Tourists rate and review places. Moderators approve reviews before they are published." },
  { icon: HeartHandshake, title: "Plan your trips", text: "Save favourites, build a travel wishlist and mark places as visited." },
  { icon: BadgeCheck, title: "Transparent data", text: "Verified information is labelled. Missing details are shown as missing, never invented." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-dark text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG} alt="Ruins of Somapura Mahavihara at Paharpur" className="absolute inset-0 -z-10 size-full object-cover opacity-30" />
        <div className="container-page py-20 sm:py-28">
          <p className="eyebrow text-leaf">About TravelSense</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Travel information for Bangladesh, <span className="italic text-leaf">organised in one place.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Information about many of Bangladesh&apos;s destinations is scattered across websites and social media. TravelSense puts
            destination details, opening hours, entry fees, safety information and reviews in one place, so travellers can plan with confidence.
          </p>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-leaf text-brand">
                <f.icon className="size-6" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">About our information</h2>
            <p className="mt-4 leading-relaxed text-muted">
              This first version contains a small set of <strong className="text-ink">demonstration destinations</strong>. Names and descriptions are based on
              general public knowledge, but opening hours, fees, coordinates and nearby facilities have <strong className="text-ink">not yet been verified</strong>.
              These pages are labelled &ldquo;Demo content · unverified&rdquo;.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Destination photos come from Wikimedia Commons and are credited to their authors. Phone numbers are only shown where they are
              nationally known, such as the 999 national emergency service.
            </p>
          </div>
          <div className="rounded-2xl bg-leaf p-6 sm:p-8">
            <h3 className="font-sans text-lg font-bold text-brand-dark">Contact</h3>
            <p className="mt-2 text-sm text-brand-dark/80">Official contact details will be added by the project owner.</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div><dt className="font-semibold text-brand-dark">Email</dt><dd className="text-brand-dark/70">contact@example.com (placeholder)</dd></div>
              <div><dt className="font-semibold text-brand-dark">Phone</dt><dd className="text-brand-dark/70">+880 XXXX-XXXXXX (placeholder)</dd></div>
              <div><dt className="font-semibold text-brand-dark">Social media</dt><dd className="text-brand-dark/70">To be supplied by the project owner</dd></div>
            </dl>
            <LinkButton href="/destinations" className="mt-6">Start exploring</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
