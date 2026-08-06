import type { ResourceGuideTool } from "./types";
import { eligibilityExplainerTool } from "./tools/eligibilityExplainer";
import { resourceSearchTool } from "./tools/resourceSearch";

const TOOL_REGISTRY: Record<string, ResourceGuideTool> = {
  [resourceSearchTool.id]: resourceSearchTool,
  [eligibilityExplainerTool.id]: eligibilityExplainerTool,
};

export function getTool(id: string): ResourceGuideTool | null {
  return TOOL_REGISTRY[id] ?? null;
}

export function listTools(): ResourceGuideTool[] {
  return Object.values(TOOL_REGISTRY);
}
