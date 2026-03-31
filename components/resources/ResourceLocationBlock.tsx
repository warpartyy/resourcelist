// components/resources/ResourceLocationBlock.tsx

import { getPrimaryLocation } from "@/lib/resources/getPrimaryLocation"

import { Database } from "@/lib/database.types";

type ResourceLocationLite = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_primary: boolean | null;
  location_name: string | null;
  phone?: string | null;
  email?: string | null;
};

type ResourceWithLocations = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  resource_locations?: ResourceLocationLite[];
};

export function ResourceLocationBlock({ resource }: { resource: ResourceWithLocations }) {
  const primary = getPrimaryLocation(resource)

const primaryLocation =
  resource.resource_locations?.find((loc) => loc.is_primary) ?? null;

const additionalLocations =
  resource.resource_locations?.filter((loc) => !loc.is_primary) ?? [];

const additionalCount = additionalLocations.length;


  return (
  <div className="space-y-4">
    {/* Primary Location */}
    <div>
      <h3 className="font-semibold">Location</h3>

      <p>{primary.address || "Address not provided"}</p>

      <p>
        {[primary.city, primary.state, primary.zip]
          .filter(Boolean)
          .join(", ") || "Location details not available"}
      </p>
    </div>
    {additionalCount > 0 && (
  <p className="text-sm text-text-muted mt-1">
    + {additionalCount} more location{additionalCount > 1 ? "s" : ""} available
  </p>
)}

  </div>
);
}