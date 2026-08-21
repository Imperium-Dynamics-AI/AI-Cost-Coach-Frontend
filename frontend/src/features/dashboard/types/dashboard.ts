export type SpendRange = "daily" | "weekly" | "monthly";

export type SpendPoint = {
  label: string;
  value: number;
};

export type KpiCardData = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type RankedSpendItem = {
  id: string;
  title: string;
  subtitle?: string;
  amountLabel: string;
  percent: number;
};

export type RecommendationConfidence = "high" | "medium";

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  confidence: RecommendationConfidence;
  currentLabel: string;
  projectedLabel: string;
  savingsLabel: string;
  href: string;
};

export type DashboardOverview = {
  kpis: KpiCardData[];
  highestCostResources: RankedSpendItem[];
  topServices: RankedSpendItem[];
  topSubscriptions: RankedSpendItem[];
  recommendations: Recommendation[];
};

export type SpendSeries = {
  range: SpendRange;
  points: SpendPoint[];
};

export type DashboardApi = {
  getOverview: () => Promise<DashboardOverview>;
  getSpendSeries: (range: SpendRange) => Promise<SpendSeries>;
};

export type NavItemId =
  | "dashboard"
  | "resources"
  | "opportunities"
  | "planner"
  | "ai-coach"
  | "settings";

export type NavItem = {
  id: NavItemId;
  label: string;
  href: string;
};
