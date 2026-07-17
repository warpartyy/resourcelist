import { pdf } from "@react-pdf/renderer";
import ResourceGuideDocument from "@/lib/pdf/ResourceGuideDocument";
import type { ResourceGuideData } from "@/lib/pdf/getResourceGuideData";

export async function generateResourceGuidePdf({
  generatedAt,
  filters,
  resources,
}: ResourceGuideData) {
  const instance = pdf(
    <ResourceGuideDocument generatedAt={generatedAt} filters={filters} resources={resources} />
  );

  return instance.toBuffer();
}
