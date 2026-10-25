"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

/** OpenStreetMap-based interactive map (no API key required). */
export function DestinationMap({ lat, lng, label, className }: { lat: number; lng: number; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#176B45;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 6px 16px -4px rgba(16,75,52,.6);border:3px solid #fff"><div style="width:10px;height:10px;border-radius:50%;background:#fff"></div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34],
      });
      L.marker([lat, lng], { icon, title: label }).addTo(map).bindPopup(`<strong>${label.replace(/</g, "&lt;")}</strong>`);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, label]);

  return <div ref={ref} className={className} role="region" aria-label={`Map showing ${label}`} />;
}
