// lib/resources/getPrimaryLocation.ts

export type ResourceLocation = {
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  is_primary: boolean | null
  location_name: string | null
}

export function getPrimaryLocation(
  resource: {
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
    resource_locations?: ResourceLocation[]
  }
) {
  // 1. Try new table
  const primary = resource.resource_locations?.find(
    (loc) => loc.is_primary
  )

  if (primary) return primary

  // 2. Fallback to legacy fields
  return {
    address: resource.address,
    city: resource.city,
    state: resource.state,
    zip: resource.zip,
    is_primary: true
  }
}