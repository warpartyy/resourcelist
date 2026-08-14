export type SearchStrategyInput = {
  state?: string;
  county?: string;
  city?: string;
  parentCategory?: string;
  subcategory: string;
  scope?: "Local" | "Nearby" | "Statewide";
  keywords?: string;
};

export type SearchStrategy = {
  strategy: string;
  phrase: string;
};

export function generateSearchStrategies({
  state,
  county,
  city,
  parentCategory,
  subcategory,
  scope = "Statewide",
  keywords,
}: SearchStrategyInput): SearchStrategy[] {
  const geography = getGeography({ city, county, state, scope });
  const countyGeography = [county ? `${county} County` : null, state]
    .filter(Boolean)
    .join(" ");
  const category = parentCategory || subcategory;
  const keywordText = keywords?.trim();

  return dedupeStrategies([
    {
      strategy: "local_service",
      phrase: compactPhrase(`${subcategory} ${keywordText ?? ""} ${geography}`),
    },
    {
      strategy: "county_assistance",
      phrase: compactPhrase(
        `${subcategory} assistance ${keywordText ?? ""} ${
          scope === "Statewide" ? state ?? "" : countyGeography
        }`,
      ),
    },
    {
      strategy: "tribal_program",
      phrase: compactPhrase(`${subcategory} tribal program ${keywordText ?? ""} ${state}`),
    },
    {
      strategy: "senior_access",
      phrase: compactPhrase(`senior ${subcategory} ${countyGeography}`),
    },
    {
      strategy: "appointment_access",
      phrase: compactPhrase(`${subcategory} appointments ${state}`),
    },
    {
      strategy: "category_provider",
      phrase: compactPhrase(`${category} providers ${keywordText ?? ""} ${geography}`),
    },
  ]);
}

function getGeography({
  city,
  county,
  state,
  scope,
}: Pick<SearchStrategyInput, "city" | "county" | "state" | "scope">) {
  if (scope === "Local") {
    return [city, county ? `${county} County` : null, state].filter(Boolean).join(" ");
  }

  if (scope === "Nearby") {
    return [county ? `${county} County` : null, state].filter(Boolean).join(" ");
  }

  return state ?? "";
}

function dedupeStrategies(strategies: SearchStrategy[]): SearchStrategy[] {
  const seen = new Set<string>();
  return strategies.filter((strategy) => {
    const key = strategy.phrase.toLowerCase();
    if (!strategy.phrase || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function compactPhrase(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
