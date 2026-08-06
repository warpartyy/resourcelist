import { calculateConfidenceRatio } from "@/lib/services/resources/ai/clarification/engine";
import type { ResourceGuideEvaluation } from "@/lib/services/resources/ai/evaluation/types";
import type { ValidationResult } from "@/lib/services/resources/ai/validation/types";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";
import type { BenchmarkRunMetrics } from "./types";

export function compareBenchmarkRun({
  promptVersion,
  searchResults,
  validation,
  evaluation,
  response,
  responseTimeMs,
}: {
  promptVersion: string;
  searchResults: ResourceSearchResponse;
  validation?: ValidationResult;
  evaluation?: ResourceGuideEvaluation;
  response?: string;
  responseTimeMs: number;
}): BenchmarkRunMetrics {
  return {
    responseTimeMs,
    promptVersion,
    validationPassed: validation?.passed ?? null,
    validationIssueCount: validation?.issues.length ?? 0,
    responseLength: response?.trim().length ?? evaluation?.responseLength ?? 0,
    groundedResourceCount: validation?.groundedResourceCount ?? 0,
    confidenceRatio: calculateConfidenceRatio(searchResults),
  };
}
