import {
  getPriorityForOpportunity,
  getPriorityForRate,
  sortByPriority,
} from "./priorities";
import type {
  AdvisorRecommendation,
  AdvisorReports,
  RecommendationRule,
} from "./types";

const MAX_RECOMMENDATIONS = 20;

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: "improvement-opportunities",
    category: "directory",
    evaluate(reports) {
      return reports.opportunities.slice(0, 8).map((opportunity) => ({
        id: `opportunity-${opportunity.need}-${opportunity.concept}-${opportunity.city}`,
        category: "directory",
        priority: getPriorityForOpportunity(opportunity),
        title: buildOpportunityTitle(opportunity),
        description:
          "A recurring search pattern is producing weak recommendation signals.",
        reason: `${opportunity.searches} searches with ${formatPercent(
          opportunity.helpfulRate
        )} helpful feedback and ${opportunity.averageRecommendations.toFixed(
          1
        )} average recommendations.`,
        recommendedAction:
          "Review directory coverage, metadata, and eligibility details for this need and location.",
        supportingMetrics: {
          searches: opportunity.searches,
          helpfulRate: opportunity.helpfulRate,
          averageRecommendations: opportunity.averageRecommendations,
          clarificationRate: opportunity.clarificationRate,
        },
      }));
    },
  },
  {
    id: "clarification-rate",
    category: "search",
    evaluate({ quality }) {
      if (quality.clarificationRate < 0.2) return [];

      return [
        {
          id: "search-high-clarification-rate",
          category: "search",
          priority: getPriorityForRate(quality.clarificationRate),
          title: "Reduce frequently clarified searches.",
          description:
            "Users are being asked follow-up questions often enough to slow down help-seeking.",
          reason: `Clarification rate is ${formatPercent(
            quality.clarificationRate
          )}.`,
          recommendedAction:
            "Review common clarified needs and add synonyms or metadata where intent is obvious.",
          supportingMetrics: {
            clarificationRate: quality.clarificationRate,
          },
        },
      ];
    },
  },
  {
    id: "fallback-mode",
    category: "search",
    evaluate({ quality }) {
      const fallback = quality.recommendationModes.find(
        (mode) => mode.name === "fallback_recommendation"
      );

      if (!fallback || fallback.count < 3) return [];

      return [
        {
          id: "search-heavy-fallback-usage",
          category: "search",
          priority: fallback.count >= 20 ? "high" : "medium",
          title: "Reduce fallback recommendation usage.",
          description:
            "The deterministic search is often expanding beyond intent-specific candidates.",
          reason: `${fallback.count} searches used fallback recommendation mode.`,
          recommendedAction:
            "Audit intent metadata for high-demand resources and strengthen category/service tagging.",
          supportingMetrics: {
            fallbackRecommendations: fallback.count,
          },
        },
      ];
    },
  },
  {
    id: "low-feedback",
    category: "ai",
    evaluate({ feedback, overview }) {
      if (overview.feedbackRate === 0 || feedback.helpfulRate >= 0.6) return [];

      return [
        {
          id: "ai-low-helpful-rate",
          category: "ai",
          priority: feedback.helpfulRate < 0.3 ? "high" : "medium",
          title: "Review AI response usefulness.",
          description:
            "Feedback suggests the conversational layer is not consistently helping administrators' users understand results.",
          reason: `Helpful rate is ${formatPercent(feedback.helpfulRate)}.`,
          recommendedAction:
            "Compare feedback selections by prompt version and review whether responses explain closest matches clearly.",
          supportingMetrics: {
            helpfulRate: feedback.helpfulRate,
            notHelpfulRate: feedback.notHelpfulRate,
            feedbackRate: overview.feedbackRate,
          },
        },
      ];
    },
  },
  {
    id: "low-resource-click-through",
    category: "directory",
    evaluate({ resources }) {
      return resources.lowestClickThroughRate
        .filter((resource) => resource.recommendations >= 5 && resource.clickThroughRate < 0.1)
        .slice(0, 4)
        .map((resource) => ({
          id: `resource-low-ctr-${resource.resourceId}`,
          category: "directory",
          priority: resource.recommendations >= 20 ? "high" : "medium",
          title: `Review ${resource.organization}.`,
          description:
            "This resource is recommended often but rarely clicked from Resource Guide results.",
          reason: `${resource.recommendations} recommendations with ${formatPercent(
            resource.clickThroughRate
          )} click-through rate.`,
          recommendedAction:
            "Check description clarity, eligibility, service labels, and whether this resource is being matched for the right needs.",
          supportingMetrics: {
            recommendations: resource.recommendations,
            clicks: resource.clicks,
            clickThroughRate: resource.clickThroughRate,
          },
        }));
    },
  },
  {
    id: "growing-demand",
    category: "community_demand",
    evaluate({ needs, concepts, geography }) {
      const recommendations: AdvisorRecommendation[] = [];
      const topNeed = needs[0];
      const topConcept = concepts[0];
      const topCity = geography.cities[0];

      if (topNeed && topNeed.count >= 10) {
        recommendations.push({
          id: `demand-need-${topNeed.need}`,
          category: "community_demand",
          priority: topNeed.count >= 50 ? "high" : "medium",
          title: `Prioritize ${formatLabel(topNeed.need)} improvements.`,
          description:
            "This need is one of the strongest signals in Resource Guide demand.",
          reason: `${topNeed.count} searches included this need.`,
          recommendedAction:
            "Review resource coverage, metadata quality, and search behavior for this need.",
          supportingMetrics: { count: topNeed.count },
        });
      }

      if (topConcept && topConcept.count >= 10) {
        recommendations.push({
          id: `demand-concept-${topConcept.concept}`,
          category: "community_demand",
          priority: topConcept.count >= 50 ? "high" : "medium",
          title: `Investigate ${formatLabel(topConcept.concept)} demand.`,
          description:
            "This search concept is appearing frequently enough to guide directory priorities.",
          reason: `${topConcept.count} searches included this concept.`,
          recommendedAction:
            "Confirm the directory has enough relevant resources and clear service metadata.",
          supportingMetrics: { count: topConcept.count },
        });
      }

      if (topCity && topCity.count >= 10) {
        recommendations.push({
          id: `demand-city-${topCity.name}`,
          category: "community_demand",
          priority: topCity.count >= 50 ? "high" : "medium",
          title: `Review coverage in ${topCity.name}.`,
          description:
            "This city is generating notable Resource Guide demand.",
          reason: `${topCity.count} searches referenced this city.`,
          recommendedAction:
            "Check whether local resources are complete, current, and well categorized.",
          supportingMetrics: { count: topCity.count },
        });
      }

      return recommendations;
    },
  },
];

export function generateAdvisorRecommendations(
  reports: AdvisorReports
): AdvisorRecommendation[] {
  return sortByPriority(
    RECOMMENDATION_RULES.flatMap((rule) => rule.evaluate(reports))
  ).slice(0, MAX_RECOMMENDATIONS);
}

function buildOpportunityTitle(opportunity: {
  concept: string;
  city: string;
}): string {
  if (opportunity.city === "unknown") {
    return `Improve ${formatLabel(opportunity.concept)} recommendations.`;
  }

  return `Improve ${formatLabel(opportunity.concept)} resources in ${opportunity.city}.`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}
