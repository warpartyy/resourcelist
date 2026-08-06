import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION } from "../../systemPrompt";
import type { ResourceGuidePrompt } from "../types";

export const V1_PROMPT: ResourceGuidePrompt = {
  version: SYSTEM_PROMPT_VERSION,
  systemPrompt: SYSTEM_PROMPT,
};
