import type {
  ImprovementActivityKey,
  ImpactRule,
  ImpactRuleKey,
  ImpactType,
} from "@/lib/services/impact/impactTypes";

export const ImpactRules: Record<ImpactRuleKey, ImpactRule> = {
  resource_approved: {
    points: 10,
    title: "Approved Resource",
    description: "A new resource was added to the public directory.",
    category: "approval",
  },
  resource_verified: {
    points: 5,
    title: "Verified Resource",
    description: "A resource was verified for accuracy.",
    category: "verification",
  },
  update_request_resolved: {
    points: 5,
    title: "Resolved Update Request",
    description: "An update request was reviewed and resolved.",
    category: "maintenance",
  },
  duplicate_merged: {
    points: 8,
    title: "Merged Duplicate",
    description: "A duplicate resource was merged into an existing entry.",
    category: "maintenance",
  },
  phone_added: {
    points: 5,
    title: "Added Phone Number",
    description: "Completed missing contact information.",
    category: "improvement",
  },
  website_added: {
    points: 5,
    title: "Added Website",
    description: "Completed missing contact information.",
    category: "improvement",
  },
  services_added: {
    points: 5,
    title: "Added Services",
    description: "Completed missing service details.",
    category: "improvement",
  },
  description_added: {
    points: 5,
    title: "Added Description",
    description: "Completed missing resource details.",
    category: "improvement",
  },
  eligibility_added: {
    points: 3,
    title: "Added Eligibility",
    description: "Completed missing eligibility details.",
    category: "improvement",
  },
  counties_added: {
    points: 3,
    title: "Added Counties Served",
    description: "Completed missing service area details.",
    category: "improvement",
  },
  email_added: {
    points: 3,
    title: "Added Email",
    description: "Completed missing contact information.",
    category: "improvement",
  },
  application_link_added: {
    points: 3,
    title: "Added Application Link",
    description: "Completed missing access details.",
    category: "improvement",
  },
  tags_added: {
    points: 1,
    title: "Added Tags",
    description: "Improved categorization and discoverability.",
    category: "improvement",
  },
  subcategories_added: {
    points: 1,
    title: "Added Subcategories",
    description: "Improved categorization and discoverability.",
    category: "improvement",
  },
  last_verified_updated: {
    points: 1,
    title: "Updated Last Verified",
    description: "Updated verification recency for a resource.",
    category: "verification",
  },
};

export const IMPROVEMENT_KEYS: ImprovementActivityKey[] = [
  "phone",
  "website",
  "services",
  "description",
  "eligibility",
  "counties",
  "email",
  "application_link",
  "tags",
  "subcategories",
  "last_verified",
];

const IMPROVEMENT_RULE_KEYS: Record<ImprovementActivityKey, ImpactRuleKey> = {
  phone: "phone_added",
  website: "website_added",
  services: "services_added",
  description: "description_added",
  eligibility: "eligibility_added",
  counties: "counties_added",
  email: "email_added",
  application_link: "application_link_added",
  tags: "tags_added",
  subcategories: "subcategories_added",
  last_verified: "last_verified_updated",
};

export function getImpactRuleKey(activityType: ImpactType, activityKey: string): ImpactRuleKey | null {
  if (activityType === "resource_approved") return "resource_approved";
  if (activityType === "resource_verified") return "resource_verified";
  if (activityType === "update_request_resolved") return "update_request_resolved";
  if (activityType === "duplicate_merged") return "duplicate_merged";

  if (activityType === "resource_improved") {
    return IMPROVEMENT_RULE_KEYS[activityKey as ImprovementActivityKey] || null;
  }

  return null;
}

export function getImpactRule(activityType: ImpactType, activityKey: string) {
  const ruleKey = getImpactRuleKey(activityType, activityKey);
  if (!ruleKey) return null;
  return ImpactRules[ruleKey];
}

export function getImpactPoints(activityType: ImpactType, activityKey: string): number {
  return getImpactRule(activityType, activityKey)?.points ?? 0;
}
