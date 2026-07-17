import { buildResourceQuery } from "@/lib/queries/buildResourceQuery";
import type { ResourceGuideFilters, ResourceGuideResource } from "@/lib/pdf/types";

export type ResourceGuideData = {
  generatedAt: string;
  filters: ResourceGuideFilters;
  resources: ResourceGuideResource[];
};

export async function getResourceGuideData(
  filters: ResourceGuideFilters
): Promise<ResourceGuideData> {
  const query = await buildResourceQuery({
    q: filters.q,
    parent: filters.parent,
    sub: filters.sub,
    tags: filters.tags,
    county: filters.county,
    state: filters.state,
  });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch resources for PDF");
  }

  const resources: ResourceGuideResource[] = (data || []).map((resource) => ({
    id: resource.id,
    organization: resource.organization,
    address: resource.address,
    zip: resource.zip,
    description: resource.description,
    eligibility: resource.eligibility,
    phone: resource.phone,
    email: resource.email,
    website: resource.website,
    application_link: resource.application_link,
    city: resource.city,
    state: resource.state,
    counties_served: resource.counties_served,
    services: resource.services,
    tags: resource.tags,
    last_verified: resource.last_verified,
  }));

  return {
    generatedAt: new Date().toISOString(),
    filters,
    resources,
  };
}
