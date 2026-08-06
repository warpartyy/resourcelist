import { z } from "zod";
import type { AiRequestUnderstanding } from "./types";

export const AI_REQUEST_UNDERSTANDING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "primaryNeed",
    "secondaryNeeds",
    "situations",
    "urgency",
    "eligibilityClues",
    "location",
    "confidence",
  ],
  properties: {
    primaryNeed: {
      anyOf: [{ type: "string", enum: getNeedIds() }, { type: "null" }],
    },
    secondaryNeeds: {
      type: "array",
      items: { type: "string", enum: getNeedIds() },
    },
    situations: {
      type: "array",
      items: { type: "string" },
    },
    urgency: {
      type: "string",
      enum: ["low", "medium", "high", "crisis"],
    },
    eligibilityClues: {
      type: "object",
      additionalProperties: false,
      required: ["tribalAffiliation", "veteran", "pregnancy", "returningCitizen"],
      properties: {
        tribalAffiliation: { anyOf: [{ type: "string" }, { type: "null" }] },
        veteran: { anyOf: [{ type: "boolean" }, { type: "null" }] },
        pregnancy: { anyOf: [{ type: "boolean" }, { type: "null" }] },
        returningCitizen: { anyOf: [{ type: "boolean" }, { type: "null" }] },
      },
    },
    location: {
      type: "object",
      additionalProperties: false,
      required: ["city", "county", "state", "matchedTerms"],
      properties: {
        city: { anyOf: [{ type: "string" }, { type: "null" }] },
        county: { anyOf: [{ type: "string" }, { type: "null" }] },
        state: { anyOf: [{ type: "string" }, { type: "null" }] },
        matchedTerms: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
} as const;

const NeedSchema = z.enum([
  "housing",
  "food",
  "utilities",
  "healthcare",
  "mental_health",
  "substance_use",
  "transportation",
  "legal",
  "employment",
  "financial_assistance",
  "childcare",
  "family_support",
  "youth",
  "safety",
  "crisis",
  "tribal_services",
]);

const NullableStringSchema = z
  .string()
  .trim()
  .transform((value) => (value ? value : undefined))
  .nullable();

export const AiRequestUnderstandingSchema = z
  .object({
    primaryNeed: NeedSchema.nullable(),
    secondaryNeeds: z.array(NeedSchema).default([]),
    situations: z.array(z.string().trim().min(1)).default([]),
    urgency: z.enum(["low", "medium", "high", "crisis"]).default("low"),
    eligibilityClues: z
      .object({
        tribalAffiliation: NullableStringSchema.optional(),
        veteran: z.boolean().nullable().optional(),
        pregnancy: z.boolean().nullable().optional(),
        returningCitizen: z.boolean().nullable().optional(),
      })
      .strict()
      .default({}),
    location: z
      .object({
        city: NullableStringSchema.optional(),
        county: NullableStringSchema.optional(),
        state: NullableStringSchema.optional(),
        matchedTerms: z.array(z.string().trim().min(1)).default([]),
      })
      .strict()
      .default({ matchedTerms: [] }),
    confidence: z.number().min(0).max(1).default(0),
  })
  .strict();

export function getEmptyAiRequestUnderstanding(): AiRequestUnderstanding {
  return {
    primaryNeed: null,
    secondaryNeeds: [],
    situations: [],
    urgency: "low",
    eligibilityClues: {},
    location: { matchedTerms: [] },
    confidence: 0,
  };
}

export function parseAiRequestUnderstandingJson(
  value: unknown
): AiRequestUnderstanding {
  const parsed = AiRequestUnderstandingSchema.safeParse(value);

  if (!parsed.success) {
    return getEmptyAiRequestUnderstanding();
  }

  return normalizeAiRequestUnderstanding(parsed.data);
}

function normalizeAiRequestUnderstanding(
  value: z.infer<typeof AiRequestUnderstandingSchema>
): AiRequestUnderstanding {
  return {
    primaryNeed: value.primaryNeed,
    secondaryNeeds: Array.from(new Set(value.secondaryNeeds)),
    situations: Array.from(new Set(value.situations)),
    urgency: value.urgency,
    eligibilityClues: {
      ...(value.eligibilityClues.tribalAffiliation
        ? { tribalAffiliation: value.eligibilityClues.tribalAffiliation }
        : {}),
      ...(typeof value.eligibilityClues.veteran === "boolean"
        ? { veteran: value.eligibilityClues.veteran }
        : {}),
      ...(typeof value.eligibilityClues.pregnancy === "boolean"
        ? { pregnancy: value.eligibilityClues.pregnancy }
        : {}),
      ...(typeof value.eligibilityClues.returningCitizen === "boolean"
        ? { returningCitizen: value.eligibilityClues.returningCitizen }
        : {}),
    },
    location: {
      ...(value.location.city ? { city: value.location.city } : {}),
      ...(value.location.county ? { county: value.location.county } : {}),
      ...(value.location.state ? { state: value.location.state } : {}),
      matchedTerms: Array.from(new Set(value.location.matchedTerms)),
    },
    confidence: value.confidence,
  };
}

function getNeedIds() {
  return [
    "housing",
    "food",
    "utilities",
    "healthcare",
    "mental_health",
    "substance_use",
    "transportation",
    "legal",
    "employment",
    "financial_assistance",
    "childcare",
    "family_support",
    "youth",
    "safety",
    "crisis",
    "tribal_services",
  ];
}
