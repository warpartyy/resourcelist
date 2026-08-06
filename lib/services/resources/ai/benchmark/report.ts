import type { BenchmarkReport, BenchmarkScenarioResult } from "./types";

export function buildBenchmarkReport(
  scenarios: BenchmarkScenarioResult[]
): BenchmarkReport {
  const runs = scenarios.flatMap((scenario) => scenario.runs);
  const validationRuns = runs.filter(
    (run) => run.metrics.validationPassed !== null
  );
  const responseTimes = runs.map((run) => run.metrics.responseTimeMs);

  return {
    generatedAt: new Date().toISOString(),
    scenarios,
    summary: {
      totalRuns: runs.length,
      validationPassRate:
        validationRuns.length > 0
          ? validationRuns.filter((run) => run.metrics.validationPassed).length /
            validationRuns.length
          : 0,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((sum, value) => sum + value, 0) /
            responseTimes.length
          : 0,
    },
  };
}
