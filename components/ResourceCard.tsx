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
  resource_locations?: {
    is_primary: boolean | null;
  }[];
};

export default function ResourceCard({
  resource,
}: {
  resource: Resource;
}) {
  function formatWebsite(url?: string) {
    if (!url) return null;

    const normalized = url.startsWith("http")
      ? url
      : `https://${url}`;

    try {
      return new URL(normalized).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  const additionalCount =
    resource.resource_locations?.filter(
      (loc) => loc.is_primary === false
    ).length || 0;

    
  return (
    <Card>
      <div className="p-2">
        {/* Clickable content (internal navigation) */}
        <Link
          href={`/resources/${resource.slug}`}
          className="block cursor-pointer"
        >
          {/* Organization */}
          <h2 className="text-xl font-semibold">
            {resource.organization}
          </h2>

          {/* Location */}
          {resource.city && (
            <div className="mt-2">
              <p className="text-sm text-text-muted">
                📍 {resource.city}
                {resource.state ? `, ${resource.state}` : ""}
              </p>

              {additionalCount > 0 && (
                <p className="text-xs text-accent">
                  + {additionalCount} more location
                  {additionalCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Phone */}
          {resource.phone && (
            <p className="mt-1 text-sm text-text-muted">
              📞 {resource.phone}
            </p>
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
        </Link>

        {/* Website (external link — OUTSIDE the Link) */}
        {resource.website && (
          <a
            href={
              resource.website.startsWith("http")
                ? resource.website
                : `https://${resource.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm text-text-muted hover:text-accent"
          >
            🌐 {formatWebsite(resource.website)}
          </a>
        )}
      </div>
    </Card>
  );
}