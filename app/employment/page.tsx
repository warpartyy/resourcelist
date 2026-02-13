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
  website: string;
  applicationLink: string;
  address: string;
  description: string;
  services: string[];
  eligibility: string;
  lastVerified: string;
};

const resources = resourcesData as Resource[];

export default function EmploymentPage() {
const filtered = resources.filter((r) =>
  r.categories.includes("employment-services")
);

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">
        Employment & Job Support
      </h1>

      <p className="text-zinc-400 mb-8 max-w-2xl">
        Access job training, workforce development programs,
        resume assistance, and re-entry employment services.
      </p>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <p className="text-zinc-500">
            No employment resources currently listed.
          </p>
        )}
      </div>
    </Container>
  );
}
