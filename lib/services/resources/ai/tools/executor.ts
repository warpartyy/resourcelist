import { getTool } from "./registry";
import type { ToolExecutionInput, ToolExecutionResult } from "./types";

export async function executeTool(
  toolId: string,
  input: ToolExecutionInput
): Promise<ToolExecutionResult> {
  const tool = getTool(toolId);

  if (!tool) {
    throw new Error(`Unknown tool: ${toolId}`);
  }

  return tool.execute(input);
}
