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

export default function FinancialAssistancePage() {
  const filtered = resources.filter((r) =>
    r.category.toLowerCase().includes("financial")
  );

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">
        Financial Assistance
      </h1>

      <p className="text-zinc-400 mb-8 max-w-2xl">
        Find rental assistance, utility support, emergency aid,
        and short-term financial relief programs.
      </p>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <p className="text-zinc-500">
            No financial assistance resources currently listed.
          </p>
        )}
      </div>
    </Container>
  );
}
