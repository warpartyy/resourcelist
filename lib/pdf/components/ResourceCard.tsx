import { Text, View } from "@react-pdf/renderer";
import type { ResourceGuideResource } from "@/lib/pdf/types";
import { pdfStyles } from "@/lib/pdf/styles";
import SectionHeading from "@/lib/pdf/components/SectionHeading";
import ContactBlock from "@/lib/pdf/components/ContactBlock";

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function compactDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function normalizeList(values?: string[] | null) {
  if (!values || values.length === 0) return [];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLocationPrimary(resource: ResourceGuideResource) {
  const cityState = [resource.city, resource.state].filter(Boolean).join(", ");
  return cityState;
}

function buildCountiesLine(resource: ResourceGuideResource) {
  if (!resource.counties_served || resource.counties_served.length === 0) return "";
  return resource.counties_served.join(", ");
}

type Props = {
  resource: ResourceGuideResource;
};

export default function ResourceCard({ resource }: Props) {
  const services = normalizeList(resource.services);
  const locationPrimary = buildLocationPrimary(resource);
  const countiesLine = buildCountiesLine(resource);

  const addressParts = [resource.address, resource.city, resource.state, resource.zip].filter(Boolean);
  const address = addressParts.join(", ");

  return (
    <View style={pdfStyles.resourceCard} wrap={false}>
      <Text style={pdfStyles.orgName}>{resource.organization || "Organization"}</Text>

      {(locationPrimary || countiesLine) && (
        <View>
          {locationPrimary ? <Text style={pdfStyles.locationPrimary}>{locationPrimary}</Text> : null}
          {countiesLine ? (
            <Text style={pdfStyles.locationSecondary}>Counties Served: {countiesLine}</Text>
          ) : null}
        </View>
      )}

      <ContactBlock
        items={[
          { label: "Phone", value: resource.phone },
          { label: "Email", value: resource.email },
          { label: "Website", value: resource.website },
          { label: "Application Link", value: resource.application_link },
          { label: "Address", value: address },
        ]}
      />

      {services.length > 0 && (
        <View style={pdfStyles.section}>
          <SectionHeading>Services</SectionHeading>
          <View style={pdfStyles.bulletList}>
            {services.map((service) => (
              <View key={`${resource.id}-${service}`} style={pdfStyles.bulletItemRow}>
                <Text style={pdfStyles.bulletDot}>•</Text>
                <Text style={pdfStyles.bulletText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {hasText(resource.eligibility) && (
        <View style={pdfStyles.section}>
          <SectionHeading>Eligibility</SectionHeading>
          <Text style={pdfStyles.bodyText}>{resource.eligibility}</Text>
        </View>
      )}

      {hasText(resource.description) && (
        <View style={pdfStyles.section}>
          <SectionHeading>Description</SectionHeading>
          <Text style={pdfStyles.bodyText}>{resource.description}</Text>
        </View>
      )}

      {hasText(resource.last_verified) && (
        <Text style={pdfStyles.footerText}>Last Verified: {compactDate(resource.last_verified)}</Text>
      )}
    </View>
  );
}
