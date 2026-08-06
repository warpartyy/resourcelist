import RecommendationCard from "./RecommendationCard";
import type {
  AdvisorRecommendation,
  AdvisorRecommendationCategory,
} from "@/lib/services/resources/ai/advisor/types";

const CATEGORY_LABELS: Record<AdvisorRecommendationCategory, string> = {
  directory: "Directory",
  search: "Search",
  ai: "AI",
  community_demand: "Community Demand",
};

export default function RecommendationGroup({
  category,
  recommendations,
}: {
  category: AdvisorRecommendationCategory;
  recommendations: AdvisorRecommendation[];
}) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{CATEGORY_LABELS[category]}</h2>
      <div className="grid gap-3">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </section>
  );
}
