"use client";

import ResourcesPanel from "../ResourcesPanel";

type Props = {
  resources: any[];
  fetchData: () => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  sortOrder: any;
  setSortOrder: any;
};

export default function ResourcesTab(props: Props) {
  return <ResourcesPanel {...props} />;
}