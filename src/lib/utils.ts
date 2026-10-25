import clsx, { type ClassValue } from "clsx";
import type { Category, ReviewStatus, Role } from "./types";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

const WIKI_SIZES = [330, 500, 960, 1280, 1920];

/**
 * Requests an appropriately sized image from known image hosts.
 * Wikimedia thumbnails are resized by swapping the "NNNpx-" prefix; Cloudinary URLs get a
 * transformation segment. Other URLs are returned unchanged.
 */
export function sizedImage(url: string | undefined | null, width: number): string {
  if (!url) return "";
  if (/wikimedia\.org\/.*\/thumb\//.test(url)) {
    const size = WIKI_SIZES.find((s) => s >= width) ?? 1920;
    return url.replace(/\/\d+px-([^/]+)$/, `/${size}px-$1`);
  }
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/c_limit,w_${width},q_auto,f_auto/`);
  }
  return url;
}

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("en-GB", opts).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export const CATEGORY_LABELS: Record<Category, string> = {
  BEACH: "Beach",
  HILL: "Hill",
  WATERFALL: "Waterfall",
  FOREST: "Forest",
  HISTORICAL: "Historical place",
  MUSEUM: "Museum",
  PARK: "Park",
  RELIGIOUS_CULTURAL: "Religious or cultural site",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export const ROLE_LABELS: Record<Role, string> = {
  TOURIST: "Tourist",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function googleMapsDirections(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function homeFor(role: Role | undefined) {
  return role === "ADMIN" || role === "MODERATOR" ? "/admin" : "/dashboard";
}
