import { calculateConfidenceRatio, determineClarification } from "../ai/clarification/engine";
import { buildPrompt } from "../ai/promptBuilder";
import { getRegisteredPrompts } from "../ai/prompts/registry";
import { searchResources } from "../intelligence/searchEngine";
import { REGRESSION_RESOURCES } from "./fixtures/resources";
import { REGRESSION_SCENARIOS } from "./fixtures/scenarios";
import type {
  RegressionAssertionResult,
  RegressionReport,
  RegressionScenario,
  ScenarioResult,
  PromptCompatibilityResult,
} from "./types";

export function runRegressionSuite(
  scenarios: RegressionScenario[] = REGRESSION_SCENARIOS
): RegressionReport {
  const scenarioResults = scenarios.map(runScenario);
  const promptCompatibility = runPromptCompatibilityChecks();
  const passed =
    scenarioResults.filter((result) => result.passed).length +
    promptCompatibility.filter((result) => result.passed).length;
  const total = scenarioResults.length + promptCompatibility.length;

  return {
    passed,
    failed: total - passed,
    scenarios: scenarioResults,
    promptCompatibility,
  };
}

function runPromptCompatibilityChecks(): PromptCompatibilityResult[] {
  const searchResults = searchResources({
    query: "I need help paying rent",
    resources: REGRESSION_RESOURCES,
  });
  const conversationContext = {
    conversationId: "fixture-conversation",
    turns: [
      {
        role: "user" as const,
        content: "I need help with housing.",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
      {
        role: "assistant" as const,
        content: "I can help look for verified directory resources.",
        timestamp: "2026-01-01T00:00:01.000Z",
      },
    ],
  };

  return getRegisteredPrompts().map((prompt) => {
    const builtPrompt = buildPrompt({
      query: "I need help paying rent",
      searchResults,
      prompt,
      conversationContext,
    });
    const systemMessage = builtPrompt.messages.find(
      (message) => message.role === "system"
    );
    const userMessage = builtPrompt.messages.find(
      (message) => message.role === "user"
    );
    const userContent = userMessage?.content ?? "";
    const assertions = [
      assertThreshold(
        "system prompt",
        "present",
        systemMessage?.content.length ?? 0,
        Boolean(systemMessage?.content.trim())
      ),
      assertIncludes("conversation context", "conversationContext", userContent),
      assertIncludes("grounded resources", "suppliedHighConfidenceResources", userContent),
      assertIncludes("current user message", "I need help paying rent", userContent),
    ];

    return {
      promptVersion: prompt.version,
      passed: assertions.every((assertion) => assertion.passed),
      assertions,
    };
  });
}

function runScenario(scenario: RegressionScenario): ScenarioResult {
  const searchResults = searchResources({
    query: scenario.query,
    resources: REGRESSION_RESOURCES,
  });
  const clarification = determineClarification({ searchResults });
  const confidenceRatio = calculateConfidenceRatio(searchResults);
  const highConfidenceMatches = searchResults.results.filter(
    (result) => result.confidence === "high"
  ).length;
  const topOrganizations = searchResults.results
    .map((result) => result.resource.organization)
    .filter((organization): organization is string => Boolean(organization));
  const assertions = buildAssertions({
    scenario,
    detectedNeeds: searchResults.detectedNeeds,
    clarificationAction: clarification.action,
    confidenceRatio,
    highConfidenceMatches,
    topOrganizations,
  });

  return {
    name: scenario.name,
    query: scenario.query,
    passed: assertions.every((assertion) => assertion.passed),
    normalizedQuery: searchResults.normalizedQuery,
    detectedNeeds: searchResults.detectedNeeds,
    expandedTerms: searchResults.expandedTerms,
    clarificationAction: clarification.action,
    confidenceRatio,
    highConfidenceMatches,
    topOrganizations,
    assertions,
  };
}

function buildAssertions({
  scenario,
  detectedNeeds,
  clarificationAction,
  confidenceRatio,
  highConfidenceMatches,
  topOrganizations,
}: {
  scenario: RegressionScenario;
  detectedNeeds: string[];
  clarificationAction: string;
  confidenceRatio: number;
  highConfidenceMatches: number;
  topOrganizations: string[];
}): RegressionAssertionResult[] {
  const assertions: RegressionAssertionResult[] = [
    assertArrayIncludesAll(
      "detected needs",
      scenario.expectedNeeds,
      detectedNeeds
    ),
    assertEqual(
      "clarification decision",
      scenario.expectedClarificationAction,
      clarificationAction
    ),
  ];

  if (scenario.expectedTopOrganizations) {
    assertions.push(
      assertOrderedPrefix(
        "top-ranked organizations",
        scenario.expectedTopOrganizations,
        topOrganizations
      )
    );
  }

  if (scenario.expectedHighConfidenceMatches !== undefined) {
    assertions.push(
      assertEqual(
        "high-confidence matches",
        scenario.expectedHighConfidenceMatches,
        highConfidenceMatches
      )
    );
  }

  if (scenario.minConfidenceRatio !== undefined) {
    assertions.push(
      assertThreshold(
        "minimum confidence ratio",
        `>= ${scenario.minConfidenceRatio}`,
        confidenceRatio,
        confidenceRatio >= scenario.minConfidenceRatio
      )
    );
  }

  if (scenario.maxConfidenceRatio !== undefined) {
    assertions.push(
      assertThreshold(
        "maximum confidence ratio",
        `<= ${scenario.maxConfidenceRatio}`,
        confidenceRatio,
        confidenceRatio <= scenario.maxConfidenceRatio
      )
    );
  }

  return assertions;
}

function assertEqual(
  name: string,
  expected: unknown,
  actual: unknown
): RegressionAssertionResult {
  const passed = expected === actual;

  return {
    name,
    passed,
    expected,
    actual,
    failureReason: passed ? undefined : `Expected ${String(expected)}, got ${String(actual)}.`,
  };
}

function assertArrayIncludesAll(
  name: string,
  expected: string[],
  actual: string[]
): RegressionAssertionResult {
  const missing = expected.filter((item) => !actual.includes(item));
  const passed = missing.length === 0;

  return {
    name,
    passed,
    expected,
    actual,
    failureReason: passed ? undefined : `Missing expected values: ${missing.join(", ")}.`,
  };
}

function assertOrderedPrefix(
  name: string,
  expected: string[],
  actual: string[]
): RegressionAssertionResult {
  const actualPrefix = actual.slice(0, expected.length);
  const passed = expected.every((item, index) => actualPrefix[index] === item);

  return {
    name,
    passed,
    expected,
    actual: actualPrefix,
    failureReason: passed
      ? undefined
      : `Expected top organizations ${expected.join(", ")}, got ${actualPrefix.join(", ")}.`,
  };
}

function assertThreshold(
  name: string,
  expected: string,
  actual: number,
  passed: boolean
): RegressionAssertionResult {
  return {
    name,
    passed,
    expected,
    actual,
    failureReason: passed ? undefined : `Expected confidence ratio ${expected}, got ${actual}.`,
  };
}

function assertIncludes(
  name: string,
  expected: string,
  actual: string
): RegressionAssertionResult {
  const passed = actual.includes(expected);

  return {
    name,
    passed,
    expected,
    actual: passed ? expected : actual,
    failureReason: passed ? undefined : `Expected prompt content to include ${expected}.`,
  };
}
