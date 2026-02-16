import { supabase } from "@/lib/supabase";
import Container from "@/components/ui/Container";
import ResourceCard from "@/components/ResourceCard";
import SearchFilters from "@/components/search/SearchFilters";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    parent?: string;
    sub?: string;
    tags?: string;
    county?: string;
    state?: string;
  };
}) {
  const { parent, sub, tags, county, state } = searchParams;

  let query = supabase
    .from("resources")
    .select("*")
    .order("organization", { ascending: true });

  if (parent) {
    query = query.contains("parent_categories", [parent]);
  }

  if (sub) {
    query = query.contains("subcategories", [sub]);
  }

  if (tags) {
    const tagArray = tags.split(",");
    query = query.overlaps("tags", tagArray);
  }

  if (county) {
    query = query.contains("counties_served", [county]);
  }

  if (state) {
    query = query.eq("state", state);
  }

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
            Browse Resources
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
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">
                No Resources Found
              </h2>
              <p className="text-zinc-400">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </main>

      </div>
    </Container>
  );
}
