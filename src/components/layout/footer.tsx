import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-dark text-white/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Destination details, safety information and trip planning for travel in Bangladesh, all in one place.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            <Phone className="size-3.5" /> National emergency: 999
          </div>
        </div>

        <FooterCol title="Explore">
          <FooterLink href="/destinations">All destinations</FooterLink>
          <FooterLink href="/destinations?sort=rating">Top rated</FooterLink>
          <FooterLink href="/#hidden-gems">Lesser-known places</FooterLink>
          <FooterLink href="/about">About TravelSense</FooterLink>
        </FooterCol>

        <FooterCol title="Categories">
          {CATEGORIES.slice(0, 6).map((c) => (
            <FooterLink key={c} href={`/destinations?category=${c}`}>
              {CATEGORY_LABELS[c]}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Contact">
          {/* Placeholders: official contact details to be supplied by the project owner. */}
          <li className="flex items-start gap-2.5 text-sm">
            <Mail className="mt-0.5 size-4 shrink-0 text-leaf" />
            <span>
              contact@example.com <span className="block text-xs text-white/50">Placeholder: official email to be added</span>
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm">
            <Phone className="mt-0.5 size-4 shrink-0 text-leaf" />
            <span>
              +880 XXXX-XXXXXX <span className="block text-xs text-white/50">Placeholder: phone number to be added</span>
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />
            <span>
              Office address <span className="block text-xs text-white/50">Placeholder: to be supplied</span>
            </span>
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© TravelSense. A university software engineering project.</p>
          <p>Destination photos from Wikimedia Commons, credited on each page. Map data © OpenStreetMap contributors.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-[0.12em] text-white">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
