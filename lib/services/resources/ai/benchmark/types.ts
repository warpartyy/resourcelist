import type { ResourceGuideEvaluation } from "@/lib/services/resources/ai/evaluation/types";
import type { ValidationResult } from "@/lib/services/resources/ai/validation/types";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";
import type { ResourceRow } from "@/lib/services/resources/intelligence/types";

export interface BenchmarkScenario {
  id: string;
  name: string;
  query: string;
  promptVersions: string[];
}

export interface BenchmarkRunMetrics {
  responseTimeMs: number;
  promptVersion: string;
  validationPassed: boolean | null;
  validationIssueCount: number;
  responseLength: number;
  groundedResourceCount: number;
  confidenceRatio: number;
}

export interface BenchmarkScenarioRun {
  scenarioId: string;
  scenarioName: string;
  query: string;
  promptVersion: string;
  status: "answered" | "clarified" | "error";
  clarification?: {
    question: string;
    options: Array<{ id: string; label: string }>;
  };
  response?: string;
  error?: string;
  searchResults: Pick<
    ResourceSearchResponse,
    "normalizedQuery" | "detectedNeeds" | "expandedTerms"
  > & {
    resultCount: number;
    highConfidenceCount: number;
  };
  metrics: BenchmarkRunMetrics;
  validation?: ValidationResult;
  evaluation?: ResourceGuideEvaluation;
}

export interface BenchmarkScenarioResult {
  id: string;
  name: string;
  query: string;
  runs: BenchmarkScenarioRun[];
}

export interface BenchmarkReport {
  generatedAt: string;
  scenarios: BenchmarkScenarioResult[];
  summary: {
    totalRuns: number;
    validationPassRate: number;
    averageResponseTime: number;
  };
}

export interface RunBenchmarkInput {
  promptVersions?: string[];
  resources?: ResourceRow[];
  scenarios?: BenchmarkScenario[];
}
