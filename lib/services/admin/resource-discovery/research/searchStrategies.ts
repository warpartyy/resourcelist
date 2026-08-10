export type SearchStrategyInput = {
  state?: string;
  county?: string;
  city?: string;
  parentCategory?: string;
  subcategory: string;
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
}: SearchStrategyInput): SearchStrategy[] {
  const geography = [city, county ? `${county} County` : null, state]
    .filter(Boolean)
    .join(" ");
  const countyGeography = [county ? `${county} County` : null, state]
    .filter(Boolean)
    .join(" ");
  const category = parentCategory || subcategory;

  return dedupeStrategies([
    {
      strategy: "local_service",
      phrase: compactPhrase(`${subcategory} ${geography}`),
    },
    {
      strategy: "county_assistance",
      phrase: compactPhrase(`${subcategory} assistance ${countyGeography}`),
    },
    {
      strategy: "tribal_program",
      phrase: compactPhrase(`${subcategory} tribal program ${state}`),
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
      phrase: compactPhrase(`${category} providers ${countyGeography}`),
    },
  ]);
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
