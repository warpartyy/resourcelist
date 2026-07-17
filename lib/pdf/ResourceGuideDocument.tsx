import {
  Document,
  Page,
  Text,
} from "@react-pdf/renderer";
import type { ResourceGuideFilters, ResourceGuideResource } from "@/lib/pdf/types";
import { pdfStyles } from "@/lib/pdf/styles";
import ResourceCard from "@/lib/pdf/components/ResourceCard";

function formatAppliedFilters(filters: ResourceGuideFilters) {
  const entries: string[] = [];
  if (filters.q) entries.push(`Search: ${filters.q}`);
  if (filters.parent) entries.push(`Parent Category: ${filters.parent}`);
  if (filters.sub) entries.push(`Subcategory: ${filters.sub}`);
  if (filters.tags) entries.push(`Tags: ${filters.tags}`);
  if (filters.county) entries.push(`County: ${filters.county}`);
  if (filters.state) entries.push(`State: ${filters.state}`);
  return entries.length > 0 ? entries.join(" | ") : "None";
}

type Props = {
  generatedAt: string;
  filters: ResourceGuideFilters;
  resources: ResourceGuideResource[];
};

export default function ResourceGuideDocument({
  generatedAt,
  filters,
  resources,
}: Props) {
  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        <Text style={pdfStyles.guideTitle}>Community Resource Directory</Text>
        <Text style={pdfStyles.guideSubtitle}>Resource Guide</Text>
        <Text style={pdfStyles.metaRow}>
          Generated: {new Date(generatedAt).toLocaleString()}
        </Text>
        <Text style={pdfStyles.metaRow}>Applied Filters: {formatAppliedFilters(filters)}</Text>
        <Text style={pdfStyles.metaRow}>Total Resources: {resources.length}</Text>

        {resources.length === 0 ? (
          <Text style={pdfStyles.emptyText}>No resources found for the selected filters.</Text>
        ) : (
          resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
        )}
      </Page>
    </Document>
  );
}
