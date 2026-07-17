import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";
import SectionHeading from "@/lib/pdf/components/SectionHeading";

export type ContactItem = {
  label: string;
  value?: string | null;
};

type Props = {
  items: ContactItem[];
};

export default function ContactBlock({ items }: Props) {
  const visibleItems = items.filter((item) => item.value && item.value.trim().length > 0);

  if (visibleItems.length === 0) return null;

  return (
    <View style={pdfStyles.section}>
      <SectionHeading>Contact Information</SectionHeading>
      {visibleItems.map((item) => (
        <Text key={item.label} style={pdfStyles.contactLine}>
          <Text style={pdfStyles.label}>{item.label}: </Text>
          {item.value}
        </Text>
      ))}
    </View>
  );
}
