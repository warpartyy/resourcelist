import type { PlannerDecision, PlannerInput, PlannerRule } from "./types";

export const chatRouteRule: PlannerRule = {
  id: "chat-route",
  decide(input: PlannerInput): PlannerDecision | null {
    if (input.route === "/api/chat") {
      return {
        toolId: "resource-search",
        reason: "Chat route uses deterministic resource search.",
      };
    }

    return null;
  },
};

export const eligibilityRouteRule: PlannerRule = {
  id: "eligibility-route",
  decide(input: PlannerInput): PlannerDecision | null {
    if (input.route === "/api/resource-guide/eligibility") {
      return {
        toolId: "eligibility-explainer",
        reason: "Eligibility route explains one approved resource.",
      };
    }

    return null;
  },
};

export const PLANNER_RULES: PlannerRule[] = [
  chatRouteRule,
  eligibilityRouteRule,
];
