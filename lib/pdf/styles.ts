import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 34,
    fontSize: 10,
    lineHeight: 1.42,
    fontFamily: "Helvetica",
    color: "#1F2937",
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  guideSubtitle: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 9,
  },
  metaRow: {
    fontSize: 8.5,
    color: "#6B7280",
    marginBottom: 3,
  },
  heading: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#374151",
    marginBottom: 4,
  },
  resourceCard: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 0.6,
    borderTopColor: "#D1D5DB",
  },
  orgName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },
  locationPrimary: {
    fontSize: 10,
    color: "#1F2937",
    marginBottom: 1,
  },
  locationSecondary: {
    fontSize: 8.5,
    color: "#6B7280",
  },
  section: {
    marginTop: 8,
  },
  contactLine: {
    fontSize: 9.5,
    color: "#1F2937",
    marginBottom: 1,
  },
  label: {
    fontWeight: "bold",
    color: "#111827",
  },
  bodyText: {
    fontSize: 9.5,
    color: "#1F2937",
  },
  bulletList: {
    marginTop: 1,
  },
  bulletItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
    paddingRight: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 8,
    color: "#4B5563",
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#1F2937",
  },
  footerText: {
    marginTop: 8,
    fontSize: 8,
    color: "#6B7280",
  },
  emptyText: {
    marginTop: 14,
    color: "#6B7280",
    fontStyle: "italic",
    fontSize: 9.5,
  },
});
