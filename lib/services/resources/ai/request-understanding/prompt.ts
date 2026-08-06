import type { ResourceGuideAiMessage } from "../types";

export const AI_REQUEST_UNDERSTANDING_PROMPT_VERSION = "ai-understanding-v1";

const SYSTEM_PROMPT = `You extract structured request understanding for a resource directory.

Return structured JSON only.

Rules:
- Extract facts explicitly supported by the user's message.
- Do not recommend resources.
- Do not rank resources.
- Do not select organizations.
- Do not infer services that are not stated.
- Do not invent eligibility, locations, or situations.
- If confidence is low, leave fields empty or null instead of guessing.
- Use only the allowed need IDs.

Allowed need IDs:
housing, food, utilities, healthcare, mental_health, substance_use, transportation, legal, employment, financial_assistance, childcare, family_support, youth, safety, crisis, tribal_services.

Common situation IDs:
unsheltered_homelessness, housing_instability, recent_job_loss, utility_shutoff_risk, food_insecurity, transportation_barrier, behavioral_health_need, domestic_violence, returning_citizen, veteran, pregnancy.`;

export function buildAiRequestUnderstandingMessages(
  message: string
): ResourceGuideAiMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `User message:\n${message}`,
    },
  ];
}
