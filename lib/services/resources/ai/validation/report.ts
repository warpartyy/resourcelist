import type { ValidationResult } from "./types";

export function summarizeValidationResult(result: ValidationResult): string {
  if (result.issues.length === 0) {
    return "Validation passed with no grounding issues.";
  }

  return [
    `Validation ${result.passed ? "passed" : "failed"} with ${result.issues.length} issue(s).`,
    ...result.issues.map(
      (issue) => `${issue.severity.toUpperCase()} ${issue.ruleId}: ${issue.evidence}`
    ),
  ].join("\n");
}
