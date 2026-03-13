import Link from "next/link";
import Card from "./ui/Card";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  description?: string;
};



export default function ResourceCard({
  resource,
}: {
  resource: Resource;
}) {
  function formatWebsite(url?: string) {
  if (!url) return null;

  const normalized = url.startsWith("http") ? url : `https://${url}`;

  try {
    return new URL(normalized).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
  return (
    <Link href={`/resources/${resource.slug}`}>
      <Card>

        {/* Organization */}
        <h2 className="text-xl font-semibold">
          {resource.organization}
        </h2>

        {/* Location */}
        {resource.city && (
          <p className="mt-2 text-sm text-text-muted">
            📍 {resource.city}{resource.state ? `, ${resource.state}` : ""}
          </p>
        )}

        {/* Phone */}
        {resource.phone && (
          <p className="mt-1 text-sm text-text-muted">
            📞 {resource.phone}
          </p>
        )}




        {/* Website */}
        {resource.website && (
  <a
    href={resource.website.startsWith("http") ? resource.website : `https://${resource.website}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-1 block text-sm text-text-muted hover:text-accent"
  >
    🌐 {formatWebsite(resource.website)}
  </a>
)}



        {/* Description */}
        {resource.description && (
          <p className="mt-3 text-text-primary line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* CTA */}
        <p className="mt-4 text-accent underline">
          View Details →
        </p>

      </Card>
    </Link>
  );
}