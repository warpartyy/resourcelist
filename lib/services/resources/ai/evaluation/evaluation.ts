import {
  calculateAverageScore,
  calculateHighConfidenceRatio,
  calculateResponseLength,
} from "./metrics";
import type {
  BuildEvaluationRecordInput,
  ResourceGuideEvaluation,
} from "./types";

export function buildEvaluationRecord({
  userQuery,
  searchResults,
  aiMetadata,
  aiResponse,
  validationResult,
}: BuildEvaluationRecordInput): ResourceGuideEvaluation {
  return {
    id: createEvaluationId(aiMetadata.timestamp),
    timestamp: aiMetadata.timestamp,
    model: aiMetadata.model,
    promptVersion: aiMetadata.promptVersion,
    userQuery,
    normalizedQuery: searchResults.normalizedQuery,
    detectedNeeds: searchResults.detectedNeeds,
    expandedTerms: searchResults.expandedTerms,
    highConfidenceResults: aiMetadata.highConfidenceCount,
    resourceCount: aiMetadata.resourceCount,
    responseTimeMs: aiMetadata.responseTimeMs,
    responseLength: calculateResponseLength(aiResponse),
    averageScore: calculateAverageScore(searchResults.results),
    highConfidenceRatio: calculateHighConfidenceRatio(searchResults.results),
    validationPassed: validationResult.passed,
    validationIssues: validationResult.issues,
    validationSeverity: validationResult.severity,
    aiResponse,
    resourceScores: aiMetadata.resourceScores,
    future: {},
  };
}

function createEvaluationId(timestamp: string): string {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `resource-guide-${timestamp}-${randomValue}`;
}
