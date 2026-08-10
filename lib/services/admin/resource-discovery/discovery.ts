import type { DirectoryCoverageReport } from "@/lib/services/admin/directory-coverage/types";
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryFilters,
  ResourceDiscoveryQueueItem,
  ResourceDiscoveryResearchInput,
} from "./types";

export async function discoverCandidateOrganizations(
  input: ResourceDiscoveryResearchInput
): Promise<ResourceDiscoveryCandidate[]> {
  void input;
  return [];
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
