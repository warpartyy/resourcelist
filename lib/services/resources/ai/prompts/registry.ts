import { RESOURCE_GUIDE_AI_CONFIG } from "../config";
import type { ResourceGuidePrompt } from "./types";
import { ELIGIBILITY_PROMPT } from "./versions/eligibility";
import { EXPERIMENTAL_PROMPT } from "./versions/experimental";
import { V1_PROMPT } from "./versions/v1";
import { V2_PROMPT } from "./versions/v2";

const PROMPT_REGISTRY: Record<string, ResourceGuidePrompt> = {
  [V1_PROMPT.version]: V1_PROMPT,
  [V2_PROMPT.version]: V2_PROMPT,
  [EXPERIMENTAL_PROMPT.version]: EXPERIMENTAL_PROMPT,
  [ELIGIBILITY_PROMPT.version]: ELIGIBILITY_PROMPT,
};

export function getPrompt(version?: string): ResourceGuidePrompt {
  if (version && PROMPT_REGISTRY[version]) {
    return PROMPT_REGISTRY[version];
  }

  return PROMPT_REGISTRY[RESOURCE_GUIDE_AI_CONFIG.defaultPromptVersion] ?? V1_PROMPT;
}

export function getRegisteredPrompts(): ResourceGuidePrompt[] {
  return Object.values(PROMPT_REGISTRY);
}
