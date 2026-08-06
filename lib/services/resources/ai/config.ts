export const RESOURCE_GUIDE_AI_CONFIG = {
  model: process.env.OPENAI_RESOURCE_GUIDE_MODEL || "gpt-5.6-terra",
  defaultPromptVersion: "v1",
  clarificationThreshold: 0.6,
  conversationWindow: 10,
} as const;
