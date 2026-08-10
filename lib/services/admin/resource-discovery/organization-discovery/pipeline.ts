import type { ResourceDiscoveryQueueItem } from "../types";
import type { ResearchPlan } from "../research/researchPlan";
import type { OrganizationCandidate } from "./candidate";
import { discoverOrganizationsForResearchPlan } from "./engine";

export type OrganizationDiscoveryPipelineInput = {
  gap?: ResourceDiscoveryQueueItem;
  plan: ResearchPlan;
};

export type OrganizationDiscoveryPipelineResult = {
  gap?: ResourceDiscoveryQueueItem;
  plan: ResearchPlan;
  candidates: OrganizationCandidate[];
  stages: string[];
};

export async function runOrganizationDiscoveryPipeline({
  gap,
  plan,
}: OrganizationDiscoveryPipelineInput): Promise<OrganizationDiscoveryPipelineResult> {
  const discovery = await discoverOrganizationsForResearchPlan({
    plan,
  });

  return {
    gap,
    plan,
    candidates: discovery.candidates,
    stages: [
      "Gap",
      "Research Plan",
      "Search Strategy",
      "Evidence Providers",
      "Organization Candidates",
      "Deduplicate",
      "Ready For Evidence Collection",
    ],
  };
}
