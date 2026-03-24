// lib/queries/buildResourceQuery.ts

import { getSupabase } from "@/lib/supabase";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/taxonomy";

type ResourceQueryFilters = {
  q?: string;
  parent?: string;
  sub?: string;
  tags?: string;
  county?: string;
  state?: string;
  status?: "approved" | "pending" | "rejected" | "deleted";
};

export async function buildResourceQuery(filters: ResourceQueryFilters) {
  const supabase = getSupabase();
    
const { q, parent, sub, tags, county, state, status } = filters;

let query = supabase
  .from("resources")
  .select("*");

// ✅ apply status filter FIRST
if (status) {
  query = query.eq("status", status);
} else {
  query = query.eq("status", "approved");
}

// ✅ then ordering
query = query.order("organization", { ascending: true });

  // -----------------------------
  // SEARCH (q)
  // -----------------------------
  if (q) {
    const cleaned = q.trim().toLowerCase();

    // Match subcategories by label
    const matchedSubSlugs = SUBCATEGORIES
      .filter((subcat) =>
        subcat.label.toLowerCase().includes(cleaned)
      )
      .map((subcat) => subcat.value);

    // Match parent categories by label
    const matchedParentSlugs = PARENT_CATEGORIES
      .filter((cat) =>
        cat.label.toLowerCase().includes(cleaned)
      )
      .map((cat) => cat.value);

    const orConditions: string[] = [
      `organization.ilike.%${cleaned}%`,
      `description.ilike.%${cleaned}%`,
    ];

    if (matchedSubSlugs.length > 0) {
      orConditions.push(
        `subcategories.ov.{${matchedSubSlugs.join(",")}}`
      );
    }

    if (matchedParentSlugs.length > 0) {
      orConditions.push(
        `parent_categories.ov.{${matchedParentSlugs.join(",")}}`
      );
    }

    query = query.or(orConditions.join(","));
  }

  // -----------------------------
  // CATEGORY FILTERS
  // -----------------------------
  if (parent) {
    query = query.contains("parent_categories", [parent]);
  }

  if (sub) {
    query = query.contains("subcategories", [sub]);
  }

  // -----------------------------
  // TAGS (comma-separated)
  // -----------------------------
  if (tags) {
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tagArray.length > 0) {
      query = query.overlaps("tags", tagArray);
    }
  }

  // -----------------------------
  // LOCATION
  // -----------------------------
  if (county) {
    query = query.contains("counties_served", [county]);
  }

  if (state) {
    query = query.eq("state", state);
  }

  return query;
}