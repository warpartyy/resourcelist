import type {
  ConceptReportItem,
  FeedbackReport,
  GeographyReport,
  IntelligenceReportResponse,
  NeedReportItem,
  OpportunityReportItem,
  OverviewReport,
  QualityReport,
  ResourcePerformanceReport,
  TrendsReport,
} from "@/lib/services/resources/ai/intelligence/reporting/types";

export type AdvisorRecommendationCategory =
  | "directory"
  | "search"
  | "ai"
  | "community_demand";

export type AdvisorPriority = "critical" | "high" | "medium" | "low";

export type AdvisorRecommendation = {
  id: string;
  category: AdvisorRecommendationCategory;
  priority: AdvisorPriority;
  title: string;
  description: string;
  reason: string;
  recommendedAction: string;
  supportingMetrics: Record<string, string | number>;
};

export type AdvisorHealthStatus = "healthy" | "needs_attention" | "critical";

export type AdvisorHealthItem = {
  area: "Search" | "AI" | "Directory" | "Feedback" | "Resources";
  status: AdvisorHealthStatus;
  summary: string;
};

export type AdvisorReports = {
  overview: OverviewReport;
  needs: NeedReportItem[];
  concepts: ConceptReportItem[];
  geography: GeographyReport;
  resources: ResourcePerformanceReport;
  feedback: FeedbackReport;
  quality: QualityReport;
  trends: TrendsReport;
  opportunities: OpportunityReportItem[];
};

export type AdvisorReportEnvelope<T> = IntelligenceReportResponse<T>;

export type AdvisorState = {
  generatedAt: string;
  reports: AdvisorReports;
  recommendations: AdvisorRecommendation[];
  health: AdvisorHealthItem[];
};

export type RecommendationRule = {
  id: string;
  category: AdvisorRecommendationCategory;
  evaluate(reports: AdvisorReports): AdvisorRecommendation[];
};
