import type {
  AdminMentionedPayload,
  EngagementEvent,
  ResourceSubmittedPayload,
} from "../types";
import type {
  MonthlyImpactReportSummary,
  WeeklyDigestSummary,
} from "../digest/types";

export type EngagementEmailTemplate = {
  subject: string;
  text: string;
  html?: string;
};

export function renderResourceSubmittedEmail(
  event: EngagementEvent<ResourceSubmittedPayload>
): EngagementEmailTemplate {
  const adminUrl = `${getBaseUrl()}/admin?tab=pending`;

  return {
    subject: "New Resource Submission",
    text: [
      "A new resource was submitted for review.",
      "",
      `Organization: ${event.payload.organization}`,
      `City: ${event.payload.city || "Not provided"}`,
      `State: ${event.payload.state || "Not provided"}`,
      `Submission date: ${formatDate(event.payload.submissionDate)}`,
      "",
      `Admin Review: ${adminUrl}`,
    ].join("\n"),
  };
}

export function renderAdminMentionEmail(
  event: EngagementEvent<AdminMentionedPayload>
): EngagementEmailTemplate {
  const actor = event.actor?.displayName || event.actor?.email || "An admin";
  const resourceUrl = `${getBaseUrl()}/admin?tab=${event.payload.section}&resource=${event.payload.resourceId}&comment=${event.payload.commentId}`;

  return {
    subject: "You were mentioned on a resource",
    text: [
      `Resource: ${event.payload.resourceName}`,
      `Mentioned by: ${actor}`,
      "",
      "Comment preview:",
      event.payload.commentPreview,
      "",
      `Open resource: ${resourceUrl}`,
    ].join("\n"),
  };
}

export function renderWeeklyDigestEmail(
  summary: WeeklyDigestSummary
): EngagementEmailTemplate {
  const baseUrl = getBaseUrl();

  return {
    subject: "Weekly Resource List Digest",
    text: [
      "This Week on Resource List",
      "",
      "Pending Work",
      `- ${summary.newResourcesSubmitted} new resource submissions`,
      `- ${summary.updateSuggestions} update suggestions`,
      `- ${summary.eventSubmissions} event submissions`,
      "",
      "Directory Activity",
      `- ${summary.resourcesApproved} resources approved`,
      `- ${summary.resourcesRejected} resources rejected`,
      `- ${summary.resourcesRestored} resources restored`,
      "",
      "Resource Guide",
      `- ${summary.totalSearches} total searches`,
      `- Helpful rate: ${formatPercent(summary.helpfulRate)}`,
      `- Top searched categories: ${formatList(summary.topSearchedCategories)}`,
      "",
      "Directory Coverage",
      `- Largest coverage gap: ${summary.largestGap || "Not available"}`,
      `- Highest demand category: ${summary.highestDemandCategory || "Not available"}`,
      "",
      "Resource Discovery",
      `- ${summary.resourceDiscoveryOpportunities} discovery opportunities awaiting review`,
      "",
      "Quick Links",
      `Admin Dashboard: ${baseUrl}/admin`,
      `Pending Submissions: ${baseUrl}/admin?tab=pending`,
      `Directory Coverage: ${baseUrl}/admin/directory-coverage`,
      `Resource Discovery: ${baseUrl}/admin/resource-discovery`,
    ].join("\n"),
  };
}

export function renderMonthlyImpactEmail(
  summary: MonthlyImpactReportSummary
): EngagementEmailTemplate {
  return {
    subject: "Monthly Community Impact",
    text: [
      "Monthly Community Impact",
      "",
      `Searches: ${summary.totalSearches}`,
      `Helpful rate: ${formatPercent(summary.helpfulRate)}`,
      `Resources added: ${summary.resourcesAdded}`,
      `Resources approved: ${summary.resourcesApproved}`,
      `Resources verified: ${summary.resourcesVerified}`,
      `Tribal resources added: ${summary.tribalResourcesAdded}`,
      `Update suggestions: ${summary.updateSuggestions}`,
      `Contributors: ${summary.contributors}`,
      `Top unmet needs: ${formatList(summary.topUnmetNeeds)}`,
      `Largest improvement since last month: ${summary.largestImprovementSinceLastMonth || "Not available"}`,
    ].join("\n"),
  };
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : new Date().toLocaleDateString();
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not available";
}
