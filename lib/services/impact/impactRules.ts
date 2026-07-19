import type { Json } from "@/lib/database.types";

export type ImpactActivityType =
  | "resource_approved"
  | "resource_verified"
  | "resource_improved"
  | "update_request_resolved"
  | "duplicate_merged";

export type ImprovementActivityKey =
  | "phone"
  | "website"
  | "services"
  | "description"
  | "eligibility"
  | "counties"
  | "email"
  | "application_link"
  | "tags"
  | "subcategories"
  | "last_verified";

export const BASE_IMPACT_POINTS: Record<Exclude<ImpactActivityType, "resource_improved">, number> = {
  resource_approved: 10,
  resource_verified: 5,
  update_request_resolved: 5,
  duplicate_merged: 8,
};

export const RESOURCE_IMPROVEMENT_POINTS: Record<ImprovementActivityKey, number> = {
  phone: 5,
  website: 5,
  services: 5,
  description: 5,
  eligibility: 3,
  counties: 3,
  email: 3,
  application_link: 3,
  tags: 1,
  subcategories: 1,
  last_verified: 1,
};

export const IMPROVEMENT_KEYS = Object.keys(
  RESOURCE_IMPROVEMENT_POINTS
) as ImprovementActivityKey[];

export function getImpactPoints(activityType: ImpactActivityType, activityKey: string): number {
  if (activityType === "resource_improved") {
    return RESOURCE_IMPROVEMENT_POINTS[activityKey as ImprovementActivityKey] ?? 0;
  }

  return BASE_IMPACT_POINTS[activityType] ?? 0;
}

export function getActivityLabel(activityType: ImpactActivityType, activityKey: string) {
  if (activityType === "resource_approved") return "Approved Resource";
  if (activityType === "resource_verified") return "Verified Resource";
  if (activityType === "update_request_resolved") return "Resolved Update Request";
  if (activityType === "duplicate_merged") return "Merged Duplicate";

  const labels: Record<ImprovementActivityKey, string> = {
    phone: "Added Phone",
    website: "Added Website",
    services: "Added Services",
    description: "Added Description",
    eligibility: "Added Eligibility",
    counties: "Added Counties",
    email: "Added Email",
    application_link: "Added Application Link",
    tags: "Added Tags",
    subcategories: "Added Subcategories",
    last_verified: "Updated Last Verified",
  };

  return labels[activityKey as ImprovementActivityKey] ?? "Improved Resource";
}

export type ImpactMetadata = Json;
