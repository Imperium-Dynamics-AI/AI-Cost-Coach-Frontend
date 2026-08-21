import { OpportunityRecommendationCard } from "@/features/opportunities/components/OpportunityRecommendationCard";
import type { OpportunityRecommendation } from "@/features/opportunities/types/opportunities";

type OpportunityRecommendationsListProps = {
  recommendations: OpportunityRecommendation[];
};

export function OpportunityRecommendationsList({
  recommendations,
}: OpportunityRecommendationsListProps) {
  return (
    <div className="space-y-10 md:space-y-12">
      {recommendations.map((recommendation, index) => (
        <div key={recommendation.id}>
          {index > 0 ? (
            <div className="mb-10 border-t border-[#E4D7F7] md:mb-12" />
          ) : null}
          <OpportunityRecommendationCard recommendation={recommendation} />
        </div>
      ))}
    </div>
  );
}
