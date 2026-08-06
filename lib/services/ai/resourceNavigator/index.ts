import { formatResourceLines } from "./formatter";
import { RESOURCE_NAVIGATOR_SYSTEM_PROMPT } from "./prompts";
import { mockSearchResources } from "./search";

export async function answerQuestion(question: string) {
  // Keep prompt referenced in the module architecture while using mocked flow.
  void RESOURCE_NAVIGATOR_SYSTEM_PROMPT;

  const { resources } = await mockSearchResources(question);
  const matchingResources = formatResourceLines(resources);

  return [
    "The Resource Navigator is connected.",
    "",
    "Your question:",
    question,
    "",
    "Matching resources:",
    matchingResources,
  ].join("\n");
}
