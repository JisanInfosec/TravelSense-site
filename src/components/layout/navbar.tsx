"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Map, Menu, ShieldCheck, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn, homeFor, initials, ROLE_LABELS } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Explore Destinations" },
  { href: "/about", label: "About" },
];

/** Static shell shown while the interactive navbar loads. */
export function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-surface/90 backdrop-blur-md md:h-[72px]">
      <div className="container-page flex h-full items-center">
        <Logo />
      </div>
    </header>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const dashboard = homeFor(user?.role);
  const onLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "z-50 transition-colors duration-300",
        pathname === "/" ? "fixed inset-x-0 top-0" : "sticky top-0",
        overHero ? "bg-transparent" : "border-b border-line bg-surface/90 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo light={overHero} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                overHero
                  ? isActive(n.href) ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                  : isActive(n.href) ? "bg-leaf text-brand-dark" : "text-muted hover:bg-leaf-soft hover:text-ink",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-10 w-40" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold transition",
                  overHero ? "border-white/30 text-white hover:bg-white/10" : "border-line bg-surface text-ink hover:border-brand/40",
                )}
              >
                <Avatar name={user.name} url={user.avatarUrl} />
                <span className="max-w-32 truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="size-4 opacity-70" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div role="menu" className="animate-fade-up absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <p className="mt-1 text-xs font-semibold text-brand">{ROLE_LABELS[user.role]}</p>
                    </div>
                    <div className="p-1.5 text-sm">
                      {user.role === "TOURIST" ? (
                        <>
                          <MenuLink href="/dashboard" icon={LayoutDashboard}>Dashboard</MenuLink>
                          <MenuLink href="/dashboard/favorites" icon={Heart}>Favorite places</MenuLink>
                          <MenuLink href="/dashboard/wishlist" icon={Map}>Travel wishlist</MenuLink>
                          <MenuLink href="/dashboard/profile" icon={User}>Edit profile</MenuLink>
                        </>
                      ) : (
                        <MenuLink href="/admin" icon={ShieldCheck}>
                          {user.role === "ADMIN" ? "Admin dashboard" : "Moderation"}
                        </MenuLink>
                      )}
                      <button
                        role="menuitem"
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-danger hover:bg-danger-soft"
                      >
                        <LogOut className="size-4" /> Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  overHero ? "text-white hover:bg-white/10" : "text-ink hover:bg-leaf-soft",
                )}
              >
                Log in
              </Link>
              <Link href="/register" className={buttonClass(overHero ? "light" : "primary", "sm", "h-10 px-5")}>
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className={cn("grid size-10 place-items-center rounded-full md:hidden", overHero ? "text-white" : "text-ink")}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-up border-t border-line bg-surface md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-xl px-4 py-3 font-semibold",
                  isActive(n.href) ? "bg-leaf text-brand-dark" : "text-ink hover:bg-leaf-soft",
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar name={user.name} url={user.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
                  </div>
                </div>
                <Link href={dashboard} className="rounded-xl px-4 py-3 font-semibold hover:bg-leaf-soft">
                  {user.role === "TOURIST" ? "My dashboard" : user.role === "ADMIN" ? "Admin dashboard" : "Moderation"}
                </Link>
                <button onClick={onLogout} className="rounded-xl px-4 py-3 text-left font-semibold text-danger hover:bg-danger-soft">
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/login" className={buttonClass("secondary")}>Log in</Link>
                <Link href="/register" className={buttonClass("primary")}>Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink hover:bg-leaf-soft">
      <Icon className="size-4 text-muted" /> {children}
    </Link>
  );
}

export function Avatar({ name, url, size = "sm" }: { name: string; url?: string | null; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "size-16 text-xl" : "size-8 text-xs";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={cn("rounded-full object-cover", cls)} />;
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white", cls)}>
      {initials(name)}
    </span>
  );
}
