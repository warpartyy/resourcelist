import type { DirectoryCoverageReport } from "@/lib/services/admin/directory-coverage/types";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/taxonomy";
import { filterExistingResourceCandidates } from "./organization-discovery/duplicates";
import { discoverPotentialResourcesWithAi } from "./providers/aiWebDiscoveryProvider";
import { buildResearchPlan } from "./research/researchPlan";
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryFilters,
  ResourceDiscoveryQueueItem,
  ResourceDiscoveryResearchInput,
} from "./types";

export async function discoverCandidateOrganizations(
  input: ResourceDiscoveryResearchInput
): Promise<ResourceDiscoveryCandidate[]> {
  const plan = buildResearchPlan({
    state: input.state,
    county: input.county || undefined,
    city: input.city || undefined,
    parentCategory: getParentCategoryLabel(input.parentCategory),
    subcategory:
      getSubcategoryLabel(input.subcategory) ??
      getParentCategoryLabel(input.parentCategory),
    gapScore: 0,
    scope: input.scope,
    keywords: input.keywords,
    maximumResults: input.maximumResults,
  });
  const candidates = await discoverPotentialResourcesWithAi({
    plan,
    searchStrategies: plan.searchStrategies,
  });

  const filteredCandidates = await filterExistingResourceCandidates(
    dedupeResourceCandidates(candidates),
  );

  return filteredCandidates.map((candidate) => ({
    ...candidate,
    whySuggested: buildWhySuggested(candidate, plan.serviceCategory.subcategory),
  }));
}

function getParentCategoryLabel(value: string): string {
  return (
    PARENT_CATEGORIES.find(
      (category) => category.value === value || category.label === value,
    )?.label ?? value
  );
}

function getParentCategoryValue(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return (
    PARENT_CATEGORIES.find(
      (category) => category.value === value || category.label === value,
    )?.value ?? value
  );
}

function getSubcategoryLabel(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return (
    SUBCATEGORIES.find((subcategory) => subcategory.value === value)?.label ??
    value
  );
}

function getSubcategoryValue(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return (
    SUBCATEGORIES.find(
      (subcategory) =>
        subcategory.value === value || subcategory.label === value,
    )?.value ?? value
  );
}

export function buildResourceDiscoveryQueue(
  report: DirectoryCoverageReport,
  filters: ResourceDiscoveryFilters
): ResourceDiscoveryQueueItem[] {
  const queue = report.coverage.flatMap((coverageItem) => {
    const geographies =
      coverageItem.geographicCoverage.length > 0
        ? coverageItem.geographicCoverage
        : [
            {
              county: "All coverage",
              resourceCount: coverageItem.resourceCount,
              searchCount: coverageItem.searchCount,
              helpfulRate: coverageItem.helpfulRate,
              gapScore: coverageItem.gapScore,
            },
          ];

    return geographies.map((geography) => ({
      id: `${coverageItem.subcategory}-${geography.county}`,
      priority: 0,
      subcategory: coverageItem.subcategory,
      subcategoryValue: getSubcategoryValue(coverageItem.subcategory),
      parentCategory: getParentCategoryValue(coverageItem.parentCategories[0]),
      geography: geography.county,
      county: geography.county === "All coverage" ? undefined : geography.county,
      gapScore: geography.gapScore,
      searchDemand: geography.searchCount,
      resourceCount: geography.resourceCount,
      helpfulRate: geography.helpfulRate,
      status: "Ready for Research" as const,
    }));
  });

  return queue
    .filter((item) =>
      filters.subcategory
        ? item.subcategory.toLowerCase().includes(filters.subcategory.toLowerCase())
        : true
    )
    .sort((left, right) => {
      if (right.gapScore !== left.gapScore) {
        return right.gapScore - left.gapScore;
      }

      return right.searchDemand - left.searchDemand;
    })
    .slice(0, 25)
    .map((item, index) => ({ ...item, priority: index + 1 }));
}

function dedupeResourceCandidates(
  candidates: ResourceDiscoveryCandidate[],
): ResourceDiscoveryCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = [
      candidate.organization.toLowerCase().trim(),
      candidate.website?.toLowerCase().trim() ?? "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildWhySuggested(
  candidate: ResourceDiscoveryCandidate,
  subcategory: string,
): string {
  const evidenceSource =
    candidate.evidenceSources?.find((source) => source.isPrimarySource)?.title ??
    candidate.evidenceSources?.[0]?.title ??
    "collected evidence";

  return [
    `${candidate.organization} was suggested because ${evidenceSource} supports its relevance to ${subcategory}.`,
    "It is not already in the directory based on organization, website, phone, and address duplicate checks.",
  ].join(" ");
}
