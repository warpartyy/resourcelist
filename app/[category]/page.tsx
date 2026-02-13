import resourcesData from "../../data/resources.json";
import ResourceCard from "../../components/ResourceCard";
import Container from "../../components/ui/Container";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  categories: string[];
  countiesServed: string[];
  phone: string;
  description: string;
};

const resources = resourcesData as Resource[];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const filtered = resources.filter((r) =>
    r.categories.includes(category)
  );

  const displayTitle = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">
        {displayTitle}
      </h1>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <p className="text-zinc-500">
<div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
  <h2 className="text-lg font-semibold mb-2">
    Resources Coming Soon
  </h2>
  <p className="text-zinc-400">
    We are actively expanding this category.
    Please check back soon or use the chat tool for assistance.
  </p>
</div>



          </p>
        )}
      </div>
    </Container>
  );
}
