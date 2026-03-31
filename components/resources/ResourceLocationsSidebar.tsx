import { ResourceLocationLite } from "@/lib/types/location-display";

type Props = {
  resource: {
    resource_locations?: ResourceLocationLite[];
  };
};

export default function ResourceLocationsSidebar({ resource }: Props) {
  const additionalLocations =
    resource.resource_locations?.filter((loc) => !loc.is_primary) ?? [];

  if (additionalLocations.length === 0) return null;

  return (
    <div className="border border-border rounded-lg p-4 bg-surface">
      <h3 className="font-semibold mb-2">Other Locations</h3>

      <p className="text-xs text-text-muted mb-3">
        Additional offices for this organization
      </p>

      <div className="space-y-3">
        {additionalLocations.map((loc, i) => (
          <div key={i} className="text-sm">

            {loc.location_name && (
              <p className="font-medium">{loc.location_name}</p>
            )}

            <p className="text-text-muted">
              {[loc.city, loc.state].filter(Boolean).join(", ")}
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}