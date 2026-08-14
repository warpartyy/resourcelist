import Container from "@/components/ui/Container";
import ResourceCard from "@/components/ResourceCard";
import SearchFilters from "@/app/search/SearchFilters";
import ActiveFilterChips from "@/app/search/ActiveFilterChips";
import MobileSearchFilters from "@/app/search/MobileSearchFilters";
import MobileSearchForm from "@/app/search/MobileSearchForm";
import { buildResourceQuery } from "@/lib/queries/buildResourceQuery";
import type { Database } from "@/lib/database.types";

type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];
type SearchResource = ResourceRow & {
  resource_locations?: { is_primary: boolean | null }[] | null;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    parent?: string;
    sub?: string;
    tags?: string;
    county?: string;
    state?: string;
    tribal?: string;
    tribe?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, parent, sub, tags, county, state, tribal, tribe } = params;

  // ✅ NEW: use shared query builder
  const query = await buildResourceQuery({
    q,
    parent,
    sub,
    tags,
    county,
    state,
    tribal,
    tribe,
  });

  const { data: resources, error } = await query;

  if (error) {
    return (
      <Container>
        <p>Error loading resources.</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-10">

        {/* Filters Sidebar */}
        <aside className="hidden lg:block lg:w-1/4">
          <SearchFilters key={JSON.stringify(params)} />
        </aside>

        {/* Results */}
        <main className="lg:w-3/4">
          <h1 className="text-3xl font-semibold mb-6">
            {q ? `Search Results for "${q}"` : "Browse Resources"}
          </h1>

          <MobileSearchForm
            q={q}
            filters={{ parent, sub, tags, county, state, tribal, tribe }}
          />

          <MobileSearchFilters />

          <ActiveFilterChips />

          {resources && resources.length > 0 ? (
            <div className="grid gap-6">
              {resources.map((resource: SearchResource) => (
                <ResourceCard
                  key={resource.id}
                  resource={{
                    id: resource.id,
                    slug: resource.slug,
                    organization: resource.organization ?? "Unnamed Resource",
                    phone: resource.phone ?? undefined,
                    website: resource.website ?? undefined,
                    city: resource.city ?? undefined,
                    state: resource.state ?? undefined,
                    description: resource.description ?? undefined,
                    resource_locations: resource.resource_locations ?? undefined,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">
                No Resources Found
              </h2>
              <p className="text-text-muted">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </main>

      </div>
    </Container>
  );
}
