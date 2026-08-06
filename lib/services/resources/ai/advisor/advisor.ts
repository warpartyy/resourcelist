import { generateAdvisorRecommendations } from "./recommendations";
import { getSupabase } from "@/lib/supabase";
import type {
  AdvisorHealthItem,
  AdvisorReportEnvelope,
  AdvisorReports,
  AdvisorState,
} from "./types";

const ENDPOINTS = {
  overview: "/api/admin/resource-guide/intelligence/overview",
  needs: "/api/admin/resource-guide/intelligence/needs",
  concepts: "/api/admin/resource-guide/intelligence/concepts",
  geography: "/api/admin/resource-guide/intelligence/geography",
  resources: "/api/admin/resource-guide/intelligence/resources",
  feedback: "/api/admin/resource-guide/intelligence/feedback",
  quality: "/api/admin/resource-guide/intelligence/quality",
  trends: "/api/admin/resource-guide/intelligence/trends?range=30d",
  opportunities: "/api/admin/resource-guide/intelligence/opportunities",
} as const;

export async function buildAdvisorState(): Promise<AdvisorState> {
  const reports = await fetchAdvisorReports();
  const recommendations = generateAdvisorRecommendations(reports);

  return {
    generatedAt: new Date().toISOString(),
    reports,
    recommendations,
    health: buildHealth(reports),
  };
}

export async function fetchAdvisorReports(): Promise<AdvisorReports> {
  const token = await getCurrentAccessToken();
  const entries = await Promise.all(
    Object.entries(ENDPOINTS).map(async ([key, endpoint]) => {
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error(`Advisor report failed: ${key}`);
      }

      const envelope = (await response.json()) as AdvisorReportEnvelope<unknown>;
      return [key, envelope.data] as const;
    })
  );

  return Object.fromEntries(entries) as AdvisorReports;
}

async function getCurrentAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export function buildHealth(reports: AdvisorReports): AdvisorHealthItem[] {
  return [
    {
      area: "Search",
      status:
        reports.quality.clarificationRate >= 0.35
          ? "critical"
          : reports.quality.clarificationRate >= 0.2
            ? "needs_attention"
            : "healthy",
      summary: `${formatPercent(reports.quality.clarificationRate)} clarification rate`,
    },
    {
      area: "AI",
      status:
        reports.quality.validationPassRate < 0.8
          ? "needs_attention"
          : "healthy",
      summary: `${formatPercent(reports.quality.validationPassRate)} validation pass rate`,
    },
    {
      area: "Directory",
      status:
        reports.opportunities.some(
          (opportunity) =>
            opportunity.averageRecommendations < 1 ||
            opportunity.helpfulRate < 0.3
        )
          ? "needs_attention"
          : "healthy",
      summary: `${reports.opportunities.length} opportunity groups`,
    },
    {
      area: "Feedback",
      status:
        reports.feedback.helpfulRate < 0.4 && reports.overview.feedbackRate > 0
          ? "needs_attention"
          : "healthy",
      summary: `${formatPercent(reports.feedback.helpfulRate)} helpful feedback`,
    },
    {
      area: "Resources",
      status:
        reports.resources.lowestClickThroughRate.some(
          (resource) =>
            resource.recommendations >= 5 && resource.clickThroughRate < 0.1
        )
          ? "needs_attention"
          : "healthy",
      summary: `${reports.resources.mostRecommendedResources.length} recommended resources tracked`,
    },
  ];
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
