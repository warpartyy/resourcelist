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

export default function TransportationPage() {
  const filtered = resources.filter((r) =>
    r.category.toLowerCase().includes("transport")
  );

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">Transportation Services</h1>
      <p className="text-zinc-400 mb-8 max-w-2xl">
        Find non-emergency medical transportation, gas voucher programs,
        transit services, and other mobility support resources.
      </p>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <p className="text-zinc-500">
            No transportation resources currently listed.
          </p>
        )}
      </div>
    </Container>
  );
}
