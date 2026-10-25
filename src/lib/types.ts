export type Role = "TOURIST" | "MODERATOR" | "ADMIN";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Category =
  | "BEACH"
  | "HILL"
  | "WATERFALL"
  | "FOREST"
  | "HISTORICAL"
  | "MUSEUM"
  | "PARK"
  | "RELIGIOUS_CULTURAL";
export type FacilityType = "HOSPITAL" | "POLICE_STATION";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  stats?: { favorites: number; wishlist: number; reviews: number; visited: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RatingSummary {
  average: number | null;
  count: number;
}

export interface DestinationCard {
  id: string;
  slug: string;
  name: string;
  category: Category;
  categoryLabel: string;
  district: string;
  division: string;
  shortDescription: string;
  latitude: number | null;
  longitude: number | null;
  isFeatured: boolean;
  isHiddenGem: boolean;
  isVerified: boolean;
  coverImage: { url: string; caption: string | null } | null;
  rating: RatingSummary;
  saves: number;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
}

export interface DestinationImage {
  id?: string;
  url: string;
  caption?: string | null;
  credit?: string | null;
  sourceUrl?: string | null;
}

export interface Facility {
  id?: string;
  type: FacilityType;
  name: string;
  address?: string | null;
  phone?: string | null;
  isVerified?: boolean;
}

export interface EmergencyContact {
  id?: string;
  label: string;
  phone: string;
  isVerified?: boolean;
}

export interface Links {
  website?: string | null;
  websiteLabel?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

export interface Safety {
  tips: string[];
  warnings: string[];
  isVerified?: boolean;
  updatedAt?: string;
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationDetail {
  id: string;
  slug: string;
  name: string;
  category: Category;
  categoryLabel: string;
  district: string;
  division: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  shortDescription: string;
  description: string;
  openingHours: string | null;
  entryFee: string | null;
  bestTimeToVisit: string | null;
  isFeatured: boolean;
  isHiddenGem: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  images: DestinationImage[];
  safety: Safety | null;
  facilities: Facility[];
  emergencyContacts: EmergencyContact[];
  links: Links | null;
  rating: RatingSummary & { distribution: Record<string, number> };
  nearby: DestinationCard[];
  viewer: {
    isFavorite: boolean;
    wishlist: { visited: boolean; visitedAt: string | null } | null;
    review: MyReview | null;
  } | null;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
}

export interface DestinationSummary {
  id: string;
  slug: string;
  name: string;
  district: string;
  images: { url: string }[];
}

export interface OwnReview extends MyReview {
  moderatedAt: string | null;
  destination: DestinationSummary;
}

export interface ModerationReview {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt: string | null;
  user: { id: string; name: string; email: string };
  moderatedBy: { name: string } | null;
  destination: DestinationSummary;
}

export interface CategoryOption {
  value: Category;
  label: string;
  count: number;
}

export interface FavoriteItem {
  savedAt: string;
  destination: DestinationCard;
}

export interface WishlistEntry {
  addedAt: string;
  visited: boolean;
  visitedAt: string | null;
  destination: DestinationCard;
}

export interface AdminUser extends User {
  _count: { reviews: number; favorites: number; wishlist: number };
}

export interface ReportRow {
  id: string;
  slug: string;
  name: string;
  district: string;
  favorites: number;
  wishlist: number;
  saves: number;
  totalReviews: number;
  approvedReviews: number;
  averageRating: number | null;
}

export interface Reports {
  totals: {
    users: number;
    newUsersLast30Days: number;
    destinations: number;
    reviews: number;
    approvedReviews: number;
    pendingReviews: number;
    rejectedReviews: number;
    favorites: number;
    wishlist: number;
    visited: number;
  };
  usersByRole: Record<Role, number>;
  destinationsByCategory: { category: Category; label: string; count: number }[];
  mostSaved: ReportRow[];
  mostReviewed: ReportRow[];
  generatedAt: string;
}

export type AdminDestination = Omit<DestinationDetail, "rating" | "nearby" | "viewer" | "categoryLabel">;
