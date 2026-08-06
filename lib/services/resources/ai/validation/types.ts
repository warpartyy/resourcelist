export type ValidationSeverity = "info" | "warning" | "error";

export type GroundedResourcePayload = {
  score: number;
  confidence: "high" | "medium" | "low";
  reasons: Array<{
    field: string;
    matchedValue: string;
    points: number;
  }>;
  resource: {
    id: string;
    organization: string | null;
    description: string | null;
    services: string[] | null;
    eligibility: string | null;
    tribal_eligibility: string | null;
    counties_served: string[] | null;
    website: string | null;
    phone: string | null;
    application_link: string | null;
  };
};

export type ValidationSearchMetadata = {
  normalizedQuery?: string;
  detectedNeeds?: string[];
  expandedTerms?: string[];
  results?: Array<{
    resourceId: string;
    score: number;
    confidence: string;
  }>;
};

export type ValidationIssue = {
  ruleId: string;
  severity: ValidationSeverity;
  description: string;
  evidence: string;
  resourceId?: string;
};

export type ValidationResult = {
  passed: boolean;
  severity: ValidationSeverity;
  issues: ValidationIssue[];
  groundedResourceCount: number;
  responseLength: number;
};

export type ValidationContext = {
  responseText: string;
  groundedResources: GroundedResourcePayload[];
  searchMetadata?: ValidationSearchMetadata;
};

export type ValidationRule = {
  id: string;
  name: string;
  validate(context: ValidationContext): ValidationIssue[];
};
