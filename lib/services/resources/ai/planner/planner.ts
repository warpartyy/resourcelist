import { PLANNER_RULES } from "./rules";
import { PlannerError } from "./types";
import type { PlannerDecision, PlannerInput } from "./types";

export function determineTool(input: PlannerInput): PlannerDecision {
  for (const rule of PLANNER_RULES) {
    const decision = rule.decide(input);

    if (decision) {
      return decision;
    }
  }

  throw new PlannerError(input.route);
}
