import type { Database } from "@/lib/database.types";

export type DirectoryCoverageResourceRow = Pick<
  Database["public"]["Tables"]["resources"]["Row"],
  | "id"
  | "submitted_at"
  | "status"
  | "state"
  | "counties_served"
  | "city"
  | "parent_categories"
  | "subcategories"
>;

export type CoverageDateRange = "all" | "today" | "7d" | "30d" | "90d";

export type DirectoryCoverageFilters = {
  dateRange: CoverageDateRange;
  startDate?: string;
  endDate?: string;
  state?: string;
  county?: string;
  city?: string;
  parentCategory?: string;
  sort?: string;
  direction: "asc" | "desc";
};

export type CoverageLevel =
  | "Excellent"
  | "Strong"
  | "Moderate"
  | "Needs Growth"
  | "Critical Gap";

export type GapLevel =
  | "Well Covered"
  | "Monitor"
  | "Growing Need"
  | "High Priority"
  | "Critical Opportunity";

export type CoverageTrend = {
  resourcesAdded30Days: number;
  searchDemandChangePercent: number;
  helpfulRateChangePercent: number;
};

export type GeographicCoverageItem = {
  county: string;
  resourceCount: number;
  searchCount: number;
  helpfulRate: number;
  gapScore: number;
  gapLevel: GapLevel;
};

export type CoverageItem = {
  subcategory: string;
  parentCategories: string[];
  resourceCount: number;
  serviceAssignments: number;
  searchCount: number;
  recommendationCount: number;
  helpfulRate: number;
  recommendationRate: number;
  gapScore: number;
  coverageLevel: CoverageLevel;
  gapLevel: GapLevel;
  gapReasons: string[];
  trend: CoverageTrend;
  geographicCoverage: GeographicCoverageItem[];
};

export type ParentCategoryRollup = {
  parentCategory: string;
  resources: number;
  subcategories: number;
  averageHelpfulRate: number;
  averageGapScore: number;
};

export type OpportunityHighlight = {
  label: string;
  title: string;
  metric: string;
  detail: string;
};

export type PriorityQueueItem = {
  priority: number;
  service: string;
  county: string;
  gapScore: number;
  reason: string;
};

export type DirectoryHealthScore = {
  score: number;
  level: "Excellent" | "Strong" | "Moderate" | "Needs Improvement";
  coverage: "Good" | "Moderate" | "Needs Improvement";
  demandMatch: "Good" | "Moderate" | "Needs Improvement";
  geographicCoverage: "Good" | "Moderate" | "Needs Improvement";
};

export type CoverageExportRow = {
  subcategory: string;
  county: string;
  resourceCount: number;
  searchCount: number;
  helpfulRate: number;
  recommendationRate: number;
  gapScore: number;
};

export type DirectoryCoverageSummary = {
  approvedResources: number;
  totalServiceAssignments: number;
  uniqueSubcategories: number;
  averageResourcesPerSubcategory: number;
  mostCoveredCategory: string | null;
  leastCoveredCategory: string | null;
  highestDemandCategory: string | null;
  highestGapScore: number;
};

export type DirectoryCoverageReport = {
  generatedAt: string;
  filters: Record<string, string | number>;
  summary: DirectoryCoverageSummary;
  health: DirectoryHealthScore;
  highlights: OpportunityHighlight[];
  parentRollups: ParentCategoryRollup[];
  coverage: CoverageItem[];
  opportunities: CoverageItem[];
  priorityQueue: PriorityQueueItem[];
  exportRows: CoverageExportRow[];
};
