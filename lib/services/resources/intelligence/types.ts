import type { Database } from "@/lib/database.types";

export type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];

export type HumanNeedId =
  | "housing"
  | "food"
  | "utilities"
  | "healthcare"
  | "mental_health"
  | "substance_use"
  | "transportation"
  | "legal"
  | "employment"
  | "financial_assistance"
  | "childcare"
  | "family_support"
  | "youth"
  | "safety"
  | "crisis"
  | "tribal_services";

export type ResourceIntent = {
  id: HumanNeedId;
  label: string;
  description: string;
};

export type IntentMatch = {
  intent: HumanNeedId;
  phrase: string;
};

export type NormalizedQuery = {
  raw: string;
  normalized: string;
  tokens: string[];
  matchedIntents: IntentMatch[];
};

export type ResourceSearchField =
  | "organization"
  | "city"
  | "services"
  | "tags"
  | "description"
  | "parent_categories"
  | "subcategories"
  | "counties_served"
  | "eligibility"
  | "tribal_eligibility";

export type FieldScoreBreakdown = Partial<Record<ResourceSearchField, number>>;
