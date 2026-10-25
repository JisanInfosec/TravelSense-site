import { Building2, Castle, Landmark, Mountain, Palmtree, Trees, Waves, Droplets } from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  BEACH: Waves,
  HILL: Mountain,
  WATERFALL: Droplets,
  FOREST: Trees,
  HISTORICAL: Castle,
  MUSEUM: Building2,
  PARK: Palmtree,
  RELIGIOUS_CULTURAL: Landmark,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} />;
}
