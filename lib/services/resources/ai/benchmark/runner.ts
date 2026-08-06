import { generateGroundedResourceGuideResponse } from "@/lib/services/resources/ai/chatService";
import { determineClarification } from "@/lib/services/resources/ai/clarification/engine";
import { buildEvaluationRecord } from "@/lib/services/resources/ai/evaluation/evaluation";
import { getPrompt, getRegisteredPrompts } from "@/lib/services/resources/ai/prompts/registry";
import { validateResourceGuideResponse } from "@/lib/services/resources/ai/validation/validator";
import { searchResources } from "@/lib/services/resources/intelligence/searchEngine";
import type { ResourceSearchResult } from "@/lib/services/resources/intelligence/searchEngine";
import { compareBenchmarkRun } from "./comparator";
import {
  BENCHMARK_RESOURCES,
  BENCHMARK_SCENARIOS,
} from "./fixtures";
import { buildBenchmarkReport } from "./report";
import type {
  BenchmarkReport,
  BenchmarkScenario,
  BenchmarkScenarioResult,
  BenchmarkScenarioRun,
  RunBenchmarkInput,
} from "./types";

const MAX_GROUNDED_RESULTS = 5;

export async function runBenchmark({
  promptVersions,
  resources = BENCHMARK_RESOURCES,
  scenarios = BENCHMARK_SCENARIOS,
}: RunBenchmarkInput = {}): Promise<BenchmarkReport> {
  const versions = promptVersions ?? getRegisteredPrompts().map((prompt) => prompt.version);
  const scenarioResults: BenchmarkScenarioResult[] = [];

  for (const scenario of scenarios) {
    const scenarioPromptVersions = scenario.promptVersions.filter((version) =>
      versions.includes(version)
    );
    const runs: BenchmarkScenarioRun[] = [];

    for (const promptVersion of scenarioPromptVersions) {
      runs.push(await runScenarioPromptVersion(scenario, promptVersion, resources));
    }

    scenarioResults.push({
      id: scenario.id,
      name: scenario.name,
      query: scenario.query,
      runs,
    });
  }

  return buildBenchmarkReport(scenarioResults);
}

async function runScenarioPromptVersion(
  scenario: BenchmarkScenario,
  promptVersion: string,
  resources: RunBenchmarkInput["resources"]
): Promise<BenchmarkScenarioRun> {
  const searchResults = searchResources({
    query: scenario.query,
    resources: resources ?? BENCHMARK_RESOURCES,
  });
  const clarification = determineClarification({ searchResults });
  const startedAt = Date.now();
  const baseRun = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    query: scenario.query,
    promptVersion,
    searchResults: summarizeSearchResults(searchResults),
  };

  if (clarification.action === "clarify") {
    return {
      ...baseRun,
      status: "clarified",
      clarification: {
        question: clarification.question,
        options: clarification.options,
      },
      metrics: compareBenchmarkRun({
        promptVersion,
        searchResults,
        responseTimeMs: Date.now() - startedAt,
      }),
    };
  }

  try {
    const prompt = getPrompt(promptVersion);
    const response = await generateGroundedResourceGuideResponse({
      query: scenario.query,
      searchResults,
      prompt,
    });
    const groundedResources = getGroundedResults(searchResults.results);
    const validation = validateResourceGuideResponse({
      responseText: response.message,
      groundedResources,
      searchMetadata: {
        normalizedQuery: searchResults.normalizedQuery,
        detectedNeeds: searchResults.detectedNeeds,
        expandedTerms: searchResults.expandedTerms,
      },
    });
    const evaluation = buildEvaluationRecord({
      userQuery: scenario.query,
      searchResults,
      aiMetadata: response.metadata,
      aiResponse: response.message,
      validationResult: validation,
    });

    return {
      ...baseRun,
      status: "answered",
      response: response.message,
      validation,
      evaluation,
      metrics: compareBenchmarkRun({
        promptVersion,
        searchResults,
        validation,
        evaluation,
        response: response.message,
        responseTimeMs: Date.now() - startedAt,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Benchmark run failed";

    return {
      ...baseRun,
      status: "error",
      error: message,
      metrics: compareBenchmarkRun({
        promptVersion,
        searchResults,
        responseTimeMs: Date.now() - startedAt,
      }),
    };
  }
}

function summarizeSearchResults(searchResults: ReturnType<typeof searchResources>) {
  return {
    normalizedQuery: searchResults.normalizedQuery,
    detectedNeeds: searchResults.detectedNeeds,
    expandedTerms: searchResults.expandedTerms,
    resultCount: searchResults.results.length,
    highConfidenceCount: searchResults.results.filter(
      (result) => result.confidence === "high"
    ).length,
  };
}

function getGroundedResults(results: ResourceSearchResult[]) {
  return results
    .filter((result) => result.confidence === "high")
    .slice(0, MAX_GROUNDED_RESULTS)
    .map((result) => ({
      score: result.score,
      confidence: result.confidence,
      reasons: result.reasons,
      resource: {
        id: result.resource.id,
        organization: result.resource.organization,
        description: result.resource.description,
        services: result.resource.services,
        eligibility: result.resource.eligibility,
        tribal_eligibility: result.resource.tribal_eligibility,
        counties_served: result.resource.counties_served,
        website: result.resource.website,
        phone: result.resource.phone,
        application_link: result.resource.application_link,
      },
    }));
}
