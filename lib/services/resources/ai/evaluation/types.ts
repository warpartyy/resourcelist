import type { ResourceGuideAiMetadata } from "@/lib/services/resources/ai/types";
import type { ValidationResult } from "@/lib/services/resources/ai/validation/types";
import type { ResourceSearchResponse } from "@/lib/services/resources/intelligence/searchEngine";

export type ResourceGuideEvaluation = {
  id: string;
  timestamp: string;
  model: string;
  promptVersion: string;
  userQuery: string;
  normalizedQuery: string;
  detectedNeeds: string[];
  expandedTerms: string[];
  highConfidenceResults: number;
  resourceCount: number;
  responseTimeMs: number;
  responseLength: number;
  averageScore: number;
  highConfidenceRatio: number;
  validationPassed: boolean;
  validationIssues: ValidationResult["issues"];
  validationSeverity: ValidationResult["severity"];
  aiResponse: string;
  resourceScores: Array<{
    resourceId: string;
    organization: string | null;
    score: number;
    confidence: string;
  }>;
  future: {
    userFeedback?: "positive" | "negative";
    regeneratedResponse?: boolean;
    acceptedRecommendation?: boolean;
    clickedResourceId?: string;
    conversationId?: string;
    sessionId?: string;
  };
};

export type BuildEvaluationRecordInput = {
  userQuery: string;
  searchResults: ResourceSearchResponse;
  aiMetadata: ResourceGuideAiMetadata;
  aiResponse: string;
  validationResult: ValidationResult;
};
