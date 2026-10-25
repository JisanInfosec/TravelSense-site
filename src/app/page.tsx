import Link from "next/link";
import { Ambulance, BadgeCheck, MapPinned, ShieldCheck, Siren, Star } from "lucide-react";
import { HeroSearch } from "@/components/destinations/search-bar";
import { CategoryTiles, HiddenGems, PlanCta, PopularDestinations, SectionHeading } from "@/components/home/sections";
import { LinkButton } from "@/components/ui/button";

const HERO = {
  url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Sajek_Valley_2_%28cropped%29.jpg/1920px-Sajek_Valley_2_%28cropped%29.jpg",
  credit: "Sajek Valley · Photo: Biplobkgc, CC BY-SA 3.0, via Wikimedia Commons",
  source: "https://commons.wikimedia.org/wiki/File:Sajek_Valley_2_(cropped).jpg",
};
const SAFETY_IMG =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Life_around_jungle.jpg/960px-Life_around_jungle.jpg";

const QUICK = [
  { label: "Beaches", href: "/destinations?category=BEACH" },
  { label: "Hills", href: "/destinations?category=HILL" },
  { label: "Waterfalls", href: "/destinations?category=WATERFALL" },
  { label: "Heritage", href: "/destinations?category=HISTORICAL" },
];

const PILLARS = [
  { icon: MapPinned, title: "Maps & directions", text: "Interactive maps with one-tap Google Maps navigation." },
  { icon: ShieldCheck, title: "Safety first", text: "Safety tips, warnings and nearby hospitals & police." },
  { icon: Star, title: "Moderated reviews", text: "Only reviews approved by moderators appear publicly." },
  { icon: BadgeCheck, title: "Clear sources", text: "Verified information is labelled separately from demo content." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-16 md:min-h-[86vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO.url} alt="Clouds over the hills of Sajek Valley" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-darker/70 via-brand-darker/35 to-brand-darker/80" />
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              <span className="size-1.5 rounded-full bg-leaf" /> Tourism information for Bangladesh
            </p>
            <h1 className="text-[2.6rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Discover Bangladesh,
              <span className="block italic text-leaf">one destination at a time.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Find destinations, check opening hours, entry fees and safety information, see where they are on the map, and save the places you want to visit.
            </p>
            <HeroSearch className="mt-8 max-w-2xl" />
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/70">Popular:</span>
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href} className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-medium text-white backdrop-blur transition hover:bg-white/20">
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <a href={HERO.source} target="_blank" rel="noreferrer" className="absolute bottom-14 right-4 max-w-[70%] truncate text-[11px] text-white/60 hover:text-white sm:bottom-20">
          {HERO.credit}
        </a>
      </section>

      {/* Pillars */}
      <section className="container-page relative z-10 -mt-10 sm:-mt-14">
        <div className="card grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex gap-4 p-5 sm:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf text-brand">
                <p.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-sans text-[15px] font-bold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PopularDestinations />
      <CategoryTiles />
      <HiddenGems />

      {/* Safety */}
      <section className="container-page py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-last lg:order-first">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SAFETY_IMG} alt="A forest trail in Lawachara National Park" loading="lazy" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
            <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-lift sm:left-auto sm:right-6 sm:w-80">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
                <Siren className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">National emergency</p>
                <p className="font-display text-2xl font-semibold text-ink">Call 999</p>
                <p className="text-xs text-muted">Police · Fire service · Ambulance</p>
              </div>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Travel safely"
              title="Know before you go"
              description="Every destination page brings together the practical and safety information you need before setting off."
            />
            <ul className="space-y-4">
              {[
                { icon: ShieldCheck, t: "Safety tips and warnings", d: "Advice on currents, trails, weather and local rules, for each destination." },
                { icon: Ambulance, t: "Nearby hospitals & police stations", d: "Names and addresses, plus phone numbers where available." },
                { icon: BadgeCheck, t: "Honest about what's verified", d: "Unverified or demonstration details are labelled. Missing information is shown as missing, never guessed." },
              ].map((x) => (
                <li key={x.t} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
                  <x.icon className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">{x.t}</p>
                    <p className="mt-0.5 text-sm text-muted">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <LinkButton href="/destinations" className="mt-8">Find a destination</LinkButton>
          </div>
        </div>
      </section>

      <PlanCta />
    </>
  );
}
