// components/resources/ResourceLocationBlock.tsx

import { getPrimaryLocation } from "@/lib/resources/getPrimaryLocation"
import { ResourceLocation } from "@/lib/resources/getPrimaryLocation";

type ResourceWithLocations = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  resource_locations?: ResourceLocation[];
};

export function ResourceLocationBlock({ resource }: { resource: ResourceWithLocations }) {
  const primary = getPrimaryLocation(resource)

  const additionalLocations =
    resource.resource_locations?.filter((loc: ResourceLocation) => !loc.is_primary) ?? []

  return (
    <div className="space-y-4">
      {/* Primary Location */}
      <div>
        <h3 className="font-semibold">Location</h3>
        <p>{primary.address}</p>
        <p>
          {primary.city}, {primary.state} {primary.zip}
        </p>
      </div>

      {/* Additional Locations */}
      {additionalLocations.length > 0 && (
        <div>
          <h3 className="font-semibold">
            Other Locations Available
          </h3>

          <p className="text-sm text-muted-foreground">
            Other locations may be closer to you
          </p>

          <ul className="mt-2 space-y-2">
            {additionalLocations.map((loc: ResourceLocation, i: number) => (

<li key={i}>
  {loc.location_name && (
    <p className="font-medium">{loc.location_name}</p>
  )}

  <p>{loc.address || "Address not provided"}</p>

  <p>
    {[loc.city, loc.state, loc.zip].filter(Boolean).join(", ") || "Location details not available"}
  </p>
</li>
            
            
            
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}