import Container from "@/components/ui/Container";
import ResourceCard from "@/components/ResourceCard";
import SearchFilters from "@/app/search/SearchFilters";
import { buildResourceQuery } from "@/lib/queries/buildResourceQuery";

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
  }>;
}) {
  const params = await searchParams;
  const { q, parent, sub, tags, county, state } = params;

  // ✅ NEW: use shared query builder
  const query = await buildResourceQuery({
    q,
    parent,
    sub,
    tags,
    county,
    state,
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
        <aside className="lg:w-1/4">
          <SearchFilters />
        </aside>

        {/* Results */}
        <main className="lg:w-3/4">
          <h1 className="text-3xl font-semibold mb-6">
            {q ? `Search Results for "${q}"` : "Browse Resources"}
          </h1>

          {resources && resources.length > 0 ? (
            <div className="grid gap-6">
              {resources.map((resource: any) => (
                <ResourceCard
                  key={resource.id}
                  resource={{
                    ...resource,
                    countiesServed: resource.counties_served,
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