import { supabase } from "../../lib/supabase";
import ResourceCard from "../../components/ResourceCard";
import Container from "../../components/ui/Container";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  categories: string[];
  counties_served: string[];
  phone: string;
  description: string;
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .contains("categories", [category]);

  if (error) {
    return (
      <Container>
        <p>Error loading resources.</p>
      </Container>
    );
  }

  const displayTitle = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-6">
        {displayTitle}
      </h1>

      <div className="grid gap-6">
        {resources && resources.length > 0 ? (
          resources.map((resource: any) => (
            <ResourceCard
              key={resource.id}
              resource={{
                ...resource,
                countiesServed: resource.counties_served
              }}
            />
          ))
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">
              Resources Coming Soon
            </h2>
            <p className="text-zinc-400">
              We are actively expanding this category.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
