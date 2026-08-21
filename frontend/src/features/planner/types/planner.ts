export type PlannerStep = 1 | 2 | 3 | 4 | 5 | 6;

export type TokenPreset = "short" | "standard" | "long";

export type AiModelOption = {
  id: string;
  name: string;
  description: string;
  inputPrice: string;
  outputPrice: string;
};

export type ChoiceOption = {
  id: string;
  title: string;
  description: string;
};

export type SearchTierOption = {
  id: string;
  title: string;
  description: string;
  monthlyCost: string;
};

export type TokenPresetOption = {
  id: TokenPreset;
  label: string;
  value: number;
};

export type GrowthPresetOption = {
  id: TokenPreset;
  label: string;
  value: number;
};

export type PlannerStepMeta = {
  step: PlannerStep;
  eyebrow: string;
  title: string;
  description: string;
};

export type PlannerFormState = {
  modelId: string;
  useBusinessDocuments: boolean;
  searchTierId: string;
  activePeople: number;
  interactionsPerDay: number;
  inputTokenPreset: TokenPreset;
  customInputTokens: number;
  outputTokenPreset: TokenPreset;
  customOutputTokens: number;
  includeSupportingCosts: boolean;
  monthlyGrowthPreset: TokenPreset;
  customGrowthValue: number;
};

export type PlannerEstimateLineItem = {
  label: string;
  amount: string;
  isUsage?: boolean;
};

export type PlannerEstimate = {
  selectionTitle: string;
  lineItems: PlannerEstimateLineItem[];
  monthlyCost: string;
  breakdown: {
    annualCost: string;
    costPerPerson: string;
    costPerInteraction: string;
    nextMonthGrowth: string;
  };
};

export type PlannerWizardContent = {
  steps: PlannerStepMeta[];
  models: AiModelOption[];
  businessDocumentChoices: ChoiceOption[];
  searchTiers: SearchTierOption[];
  supportingCostChoices: ChoiceOption[];
  inputTokenPresets: TokenPresetOption[];
  outputTokenPresets: TokenPresetOption[];
  growthPresets: GrowthPresetOption[];
  defaultForm: PlannerFormState;
};

export type PlannerReviewRow = {
  id: string;
  label: string;
  value: string;
  editStep: PlannerStep;
};

export type ModelAlternativeTier = "selected" | "lower" | "higher";

export type ModelAlternative = {
  id: string;
  name: string;
  description: string;
  tier: ModelAlternativeTier;
  monthlyCost: string;
  difference: string;
  vsSelected: string;
  annualCost: string;
  costPerPerson: string;
  costPerInteraction: string;
  isCheaper?: boolean;
};

export type PlannerComparisonResult = {
  alternatives: ModelAlternative[];
  comparisonRows: ModelAlternative[];
};

export interface PlannerApi {
  getWizardContent(): Promise<PlannerWizardContent>;
  calculateEstimate(form: PlannerFormState): Promise<PlannerEstimate>;
  getComparison(form: PlannerFormState): Promise<PlannerComparisonResult>;
}
