import type { ClarificationQuestion, ClarificationQuestionId } from "./types";

export const CLARIFICATION_QUESTIONS: Record<
  ClarificationQuestionId,
  ClarificationQuestion
> = {
  generic_help: {
    id: "generic_help",
    question: "What kind of help are you looking for?",
    options: [
      { id: "housing", label: "Housing" },
      { id: "food", label: "Food" },
      { id: "healthcare", label: "Healthcare" },
      { id: "employment", label: "Employment" },
      { id: "utilities", label: "Utilities" },
      { id: "legal", label: "Legal" },
      { id: "transportation", label: "Transportation" },
      { id: "other", label: "Other" },
    ],
  },
  housing: {
    id: "housing",
    question: "Which best describes your situation?",
    options: [
      { id: "rent_help", label: "Need help paying rent" },
      { id: "eviction", label: "Facing eviction" },
      { id: "homeless", label: "Homeless" },
      { id: "looking_for_housing", label: "Looking for housing" },
    ],
  },
  food: {
    id: "food",
    question: "What do you need help with?",
    options: [
      { id: "food_pantry", label: "Food pantry" },
      { id: "meals", label: "Meals" },
      { id: "snap", label: "SNAP" },
      { id: "other", label: "Other" },
    ],
  },
  healthcare: {
    id: "healthcare",
    question: "What kind of healthcare are you looking for?",
    options: [
      { id: "medical", label: "Medical" },
      { id: "dental", label: "Dental" },
      { id: "mental_health", label: "Mental health" },
      { id: "substance_use", label: "Substance use" },
      { id: "other", label: "Other" },
    ],
  },
};
