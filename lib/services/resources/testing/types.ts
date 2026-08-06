import type { Database } from "@/lib/database.types";
import type { ClarificationDecision } from "@/lib/services/resources/ai/clarification/types";
import type { HumanNeedId } from "@/lib/services/resources/intelligence/types";

export type RegressionResource =
  Database["public"]["Tables"]["resources"]["Row"];

export type RegressionScenario = {
  name: string;
  query: string;
  expectedNeeds: HumanNeedId[];
  expectedClarificationAction: ClarificationDecision["action"];
  expectedTopOrganizations?: string[];
  expectedHighConfidenceMatches?: number;
  minConfidenceRatio?: number;
  maxConfidenceRatio?: number;
};

export type RegressionAssertionResult = {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  failureReason?: string;
};

export type ScenarioResult = {
  name: string;
  query: string;
  passed: boolean;
  normalizedQuery: string;
  detectedNeeds: HumanNeedId[];
  expandedTerms: string[];
  clarificationAction: ClarificationDecision["action"];
  confidenceRatio: number;
  highConfidenceMatches: number;
  topOrganizations: string[];
  assertions: RegressionAssertionResult[];
};

export type RegressionReport = {
  passed: number;
  failed: number;
  scenarios: ScenarioResult[];
  promptCompatibility: PromptCompatibilityResult[];
};

export type PromptCompatibilityResult = {
  promptVersion: string;
  passed: boolean;
  assertions: RegressionAssertionResult[];
};
