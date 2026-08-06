import { VALIDATION_RULES } from "./rules";
import type {
  ValidationContext,
  ValidationResult,
  ValidationSeverity,
} from "./types";

export function validateResourceGuideResponse(
  context: ValidationContext
): ValidationResult {
  const issues = VALIDATION_RULES.flatMap((rule) => rule.validate(context));
  const severity = getHighestSeverity(issues.map((issue) => issue.severity));

  return {
    passed: !issues.some((issue) => issue.severity === "error"),
    severity,
    issues,
    groundedResourceCount: context.groundedResources.length,
    responseLength: context.responseText.trim().length,
  };
}

function getHighestSeverity(severities: ValidationSeverity[]): ValidationSeverity {
  if (severities.includes("error")) {
    return "error";
  }

  if (severities.includes("warning")) {
    return "warning";
  }

  return "info";
}
