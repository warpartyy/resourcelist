import { SUBCATEGORY_PARENT_MAP } from "@/lib/taxonomy";

/**
 * Derive parent categories from subcategories
 */
export function deriveParentCategories(
  subcategories: string[] = []
): string[] {
  return Array.from(
    new Set(
      subcategories
        .map((sub) => SUBCATEGORY_PARENT_MAP[sub])
        .filter(Boolean)
    )
  );
}
