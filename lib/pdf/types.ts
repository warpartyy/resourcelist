import type { Tables } from "@/lib/database.types";

export type ResourceGuideFilters = {
  q?: string;
  parent?: string;
  sub?: string;
  tags?: string;
  county?: string;
  state?: string;
};

type ResourceRow = Tables<"resources">;

export type ResourceGuideResource = Pick<
  ResourceRow,
  | "id"
  | "organization"
  | "address"
  | "zip"
  | "description"
  | "eligibility"
  | "phone"
  | "email"
  | "website"
  | "application_link"
  | "city"
  | "state"
  | "counties_served"
  | "services"
  | "tags"
  | "last_verified"
>;
