import type { RegressionReport } from "./types";

export function formatRegressionReport(report: RegressionReport): string {
  const header = `Regression suite: ${report.passed} passed, ${report.failed} failed`;
  const scenarioLines = report.scenarios.map((scenario) => {
    const status = scenario.passed ? "PASS" : "FAIL";
    const failures = scenario.assertions
      .filter((assertion) => !assertion.passed)
      .map((assertion) => `    - ${assertion.name}: ${assertion.failureReason}`)
      .join("\n");

    return [`${status} ${scenario.name}`, failures].filter(Boolean).join("\n");
  });

  return [header, ...scenarioLines].join("\n");
}
