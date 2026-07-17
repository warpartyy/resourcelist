import { Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";

type Props = {
  children: string;
};

export default function SectionHeading({ children }: Props) {
  return <Text style={pdfStyles.heading}>{children}</Text>;
}
