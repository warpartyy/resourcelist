export interface PlannerInput {
  route: string;
  message?: string;
  resourceId?: string;
}

export interface PlannerDecision {
  toolId: string;
  reason: string;
}

export interface PlannerRule {
  id: string;
  decide(input: PlannerInput): PlannerDecision | null;
}

export class PlannerError extends Error {
  constructor(route: string) {
    super(`No AI tool planner rule matched route: ${route}`);
    this.name = "PlannerError";
  }
}
