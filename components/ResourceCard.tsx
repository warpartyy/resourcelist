import Link from "next/link";
import Card from "./ui/Card";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  countiesServed: string[];
  phone: string;
  description: string;

  // Optional structured fields
  programType?: string;
  programLength?: string;
  housingType?: string;
  bedCapacity?: number;
};

export default function ResourceCard({
  resource,
}: {
  resource: Resource;
}) {
  return (
    <Link href={`/resources/${resource.slug}`}>
      <Card>

        {/* Organization */}
        <h2 className="text-xl font-semibold">
          {resource.organization}
        </h2>

        {/* Counties Served */}
        <p className="text-sm text-text-muted mt-1">
          📍 {resource.countiesServed.join(", ")} County
        </p>

        {/* Short Description */}
        <p className="mt-3 text-text-primary">
          {resource.description}
        </p>

        {/* Optional: Program Type */}
        {resource.programType && (
          <p className="mt-2 text-sm text-text-muted">
            🏥 Type: {resource.programType}
          </p>
        )}

        {/* Optional: Program Length (important for inpatient) */}
        {resource.programLength && (
          <p className="mt-1 text-sm text-text-muted">
            ⏳ Length: {resource.programLength}
          </p>
        )}

        {/* Optional: Housing Type */}
        {resource.housingType && (
          <p className="mt-1 text-sm text-text-muted">
            🏠 Housing: {resource.housingType}
          </p>
        )}

        {/* Optional: Bed Capacity */}
        {resource.bedCapacity && (
          <p className="mt-1 text-sm text-text-muted">
            🛏 Beds Available: {resource.bedCapacity}
          </p>
        )}

        {/* Phone Preview */}
        <p className="mt-3 text-sm text-text-muted">
          📞 {resource.phone}
        </p>

        {/* CTA */}
        <p className="mt-4 text-accent underline">
          View Details →
        </p>

      </Card>
    </Link>
  );
}
