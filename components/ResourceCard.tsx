import Card from "./ui/Card";

type Resource = {
  id: string;
  organization: string;
  county: string;
  category: string;
  phone: string;
  description: string;
  lastVerified: string;
};

export default function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">
        {resource.organization}
      </h2>

      <p className="text-sm text-zinc-400">
        {resource.county} County • {resource.category}
      </p>

      <p className="mt-2 text-zinc-200">
        {resource.description}
      </p>

      <p className="mt-3 font-medium text-white">
        📞 {resource.phone}
      </p>

      <p className="text-xs text-zinc-500 mt-2">
        Last Verified: {resource.lastVerified}
      </p>
    </Card>
  );
}
