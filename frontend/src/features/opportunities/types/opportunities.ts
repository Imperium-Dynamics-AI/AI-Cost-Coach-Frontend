export type ConfidenceLevel = "high" | "medium" | "low";

export type OpportunityMetric = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type OpportunityRecommendation = {
  id: string;
  title: string;
  resourceName: string;
  opportunityType: string;
  savingsSummary: string;
  confidence: ConfidenceLevel;
  why: string;
  currentCost: string;
  projectedCost: string;
  monthlySavings: string;
  annualSavings: string;
  evidence: string[];
  assumptions: string[];
  risks: string[];
  limitations: string[];
  ruleLabel: string;
};

export type OpportunitiesOverview = {
  metrics: OpportunityMetric[];
  recommendations: OpportunityRecommendation[];
};

export interface OpportunitiesApi {
  getOverview(): Promise<OpportunitiesOverview>;
  snoozeRecommendation(id: string): Promise<void>;
  dismissRecommendation(id: string): Promise<void>;
  acceptRecommendation(id: string): Promise<void>;
};

export type RecommendationAction = "snooze" | "dismiss" | "accept" | null;
