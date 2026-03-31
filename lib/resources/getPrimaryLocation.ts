import { Database } from "@/lib/database.types";

type LocationLike = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_primary: boolean | null;
  location_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

type NormalizedLocation = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_primary: boolean;
  location_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function getPrimaryLocation(
  resource: {
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone?: string | null;
    email?: string | null;
    resource_locations?: LocationLike[];
  }
): NormalizedLocation {
  // 1. Try new table
  const primary = resource.resource_locations?.find(
    (loc) => loc.is_primary
  );

  if (primary) {
    return {
      address: primary.address,
      city: primary.city,
      state: primary.state,
      zip: primary.zip,
      is_primary: true,
      location_name: primary.location_name,
      phone: primary.phone,
      email: primary.email,
    };
  }

  // 2. Fallback to legacy fields
  return {
    address: resource.address,
    city: resource.city,
    state: resource.state,
    zip: resource.zip,
    is_primary: true,
    phone: resource.phone ?? null,   // ✅ IMPORTANT
    email: resource.email ?? null,   // ✅ IMPORTANT
  };
}