import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar, NavbarFallback } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "TravelSense — Discover Bangladesh", template: "%s · TravelSense" },
  description:
    "Discover tourist destinations in Bangladesh: opening hours, entry fees, safety information, maps, reviews and trip planning in one place.",
};

export const viewport: Viewport = { themeColor: "#176B45" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
