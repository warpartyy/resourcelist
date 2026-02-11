import resourcesData from "../../data/resources.json";
import ResourceCard from "../../components/ResourceCard";
import Container from "../../components/ui/Container";

type Resource = {
  id: string;
  organization: string;
  county: string;
  category: string;
  phone: string;
  description: string;
  lastVerified: string;
};

const resources = resourcesData as Resource[];

export default function LegalPage() {
  const filtered = resources.filter((r) =>
    r.category.toLowerCase().includes("legal")
  );

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">
        Legal Assistance
      </h1>

      <p className="text-zinc-400 mb-8 max-w-2xl">
        Access legal aid services including expungement support,
        court advocacy, and re-entry legal assistance.
      </p>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <p className="text-zinc-500">
            No legal assistance resources currently listed.
          </p>
        )}
      </div>
    </Container>
  );
}
