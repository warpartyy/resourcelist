import { getSupabase } from "@/lib/supabase";
import Container from "@/components/ui/Container";
import ResourceCard from "@/components/ResourceCard";
import SearchFilters from "@/app/search/SearchFilters";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/taxonomy";


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



const supabase = getSupabase(); // 👈 add this

let query = supabase
  .from("resources")
  .select("*")
  .order("organization", { ascending: true });




if (q) {
  const cleaned = q.trim().toLowerCase();

  // Match subcategories by label
  const matchedSubSlugs = SUBCATEGORIES
    .filter(sub =>
      sub.label.toLowerCase().includes(cleaned)
    )
    .map(sub => sub.value);

  // Match parent categories by label
  const matchedParentSlugs = PARENT_CATEGORIES
    .filter(cat =>
      cat.label.toLowerCase().includes(cleaned)
    )
    .map(cat => cat.value);

  // Build OR conditions
  const orConditions = [
    `organization.ilike.%${cleaned}%`,
    `description.ilike.%${cleaned}%`,
  ];

  if (matchedSubSlugs.length > 0) {
    orConditions.push(
      `subcategories.ov.{${matchedSubSlugs.join(",")}}`
    );
  }

  if (matchedParentSlugs.length > 0) {
    orConditions.push(
      `parent_categories.ov.{${matchedParentSlugs.join(",")}}`
    );
  }

  query = query.or(orConditions.join(","));
}

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
