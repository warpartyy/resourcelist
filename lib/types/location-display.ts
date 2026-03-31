export type ResourceLocationLite = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_primary: boolean | null;
  location_name: string | null;
  phone?: string | null;
  email?: string | null;
};