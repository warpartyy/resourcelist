import {
  generateSearchStrategies,
  type SearchStrategy,
} from "./searchStrategies";

export type ResearchPlanInput = {
  state?: string;
  county?: string;
  city?: string;
  parentCategory?: string;
  subcategory: string;
  gapScore: number;
  scope?: "Local" | "Nearby" | "Statewide";
  keywords?: string;
  maximumResults?: number;
};

export type ResearchPlan = {
  searchObjective: string;
  geography: {
    state?: string;
    county?: string;
    city?: string;
  };
  serviceCategory: {
    parentCategory?: string;
    subcategory: string;
  };
  priority: "Critical" | "High" | "Medium" | "Low";
  scope: "Local" | "Nearby" | "Statewide";
  keywords?: string;
  maximumResults: number;
  searchStrategies: SearchStrategy[];
  recommendedSearchPhrases: string[];
};

export function buildResearchPlan(input: ResearchPlanInput): ResearchPlan {
  const searchStrategies = generateSearchStrategies(input);
  const geographyLabel = [input.city, input.county, input.state]
    .filter(Boolean)
    .join(", ");

  return {
    searchObjective: `Identify real organizations that may provide ${input.subcategory}${
      geographyLabel ? ` in ${geographyLabel}` : ""
    }.`,
    geography: {
      state: input.state,
      county: input.county,
      city: input.city,
    },
    serviceCategory: {
      parentCategory: input.parentCategory,
      subcategory: input.subcategory,
    },
    priority: getResearchPriority(input.gapScore),
    scope: input.scope ?? "Statewide",
    keywords: input.keywords?.trim() || undefined,
    maximumResults: clampMaximumResults(input.maximumResults),
    searchStrategies,
    recommendedSearchPhrases: searchStrategies.map((strategy) => strategy.phrase),
  };
}

function getResearchPriority(gapScore: number): ResearchPlan["priority"] {
  if (gapScore >= 81) return "Critical";
  if (gapScore >= 61) return "High";
  if (gapScore >= 41) return "Medium";
  return "Low";
}

function clampMaximumResults(value?: number) {
  if (!value || Number.isNaN(value)) {
    return 5;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}
