import type {
  OpportunitiesOverview,
  OpportunityRecommendation,
} from "@/features/opportunities/types/opportunities";

const PRIMARY_RECOMMENDATION: OpportunityRecommendation = {
  id: "rec-model-rightsizing-v3",
  title: "Switch GPT-4.1 → GPT-4.1 Mini",
  resourceName: "aoai-prod-eastus",
  opportunityType: "Saving opportunity",
  savingsSummary: "Save $550/mo",
  confidence: "high",
  why: "Workload characteristics indicate the smaller model may satisfy the supported workload.",
  currentCost: "$1,200/mo",
  projectedCost: "$650/mo",
  monthlySavings: "$550/mo",
  annualSavings: "$6,600",
  evidence: [
    "Usage: 94% of requests use prompts under 500 tokens with short completions.",
    "Cost: GPT-4.1 accounts for 33% of total Azure OpenAI spend on this resource.",
    "Pricing: GPT-4.1 Mini is priced at $0.00044/1K input, $0.00176/1K output (Azure Retail Prices, eastus).",
  ],
  assumptions: [
    "Traffic mix stays similar to the last 30 days.",
    "No hard dependency on GPT-4.1-only capabilities in current prompts.",
  ],
  risks: [
    "Response quality may degrade for the small share of complex prompts.",
  ],
  limitations: [
    "Based on token volume, not a quality/accuracy evaluation of outputs.",
  ],
  ruleLabel: "Last 30 days Rule: rec-model-rightsizing v3",
};

const ADDITIONAL_RECOMMENDATIONS: OpportunityRecommendation[] = [
  {
    id: "rec-search-rightsizing-v2",
    title: "Right-size AI Search from Standard to Basic",
    resourceName: "aisearch-prod-index",
    opportunityType: "Saving opportunity",
    savingsSummary: "Save $370/mo",
    confidence: "medium",
    why: "Search traffic and replica usage indicate a smaller SKU may support current query volume.",
    currentCost: "$820/mo",
    projectedCost: "$450/mo",
    monthlySavings: "$370/mo",
    annualSavings: "$4,440",
    evidence: [
      "Usage: Average query volume remains below 40% of Standard tier capacity.",
      "Cost: AI Search accounts for 18% of monthly platform spend in this subscription.",
      "Pricing: Basic tier pricing aligns with current replica and partition configuration.",
    ],
    assumptions: [
      "Semantic ranking requirements remain unchanged over the next 30 days.",
      "No planned increase in indexed document volume beyond current growth.",
    ],
    risks: [
      "Query latency may increase during peak indexing windows.",
    ],
    limitations: [
      "Recommendation is based on cost and capacity metrics, not relevance scoring quality.",
    ],
    ruleLabel: "Last 30 days Rule: rec-search-rightsizing v2",
  },
  {
    id: "rec-vm-reservation-v1",
    title: "Purchase reserved capacity for production VMs",
    resourceName: "vm-prod-eastus-01",
    opportunityType: "Saving opportunity",
    savingsSummary: "Save $290/mo",
    confidence: "high",
    why: "Steady runtime patterns suggest a 1-year reservation would reduce compute spend materially.",
    currentCost: "$980/mo",
    projectedCost: "$690/mo",
    monthlySavings: "$290/mo",
    annualSavings: "$3,480",
    evidence: [
      "Usage: VM uptime exceeded 92% over the last 30 days.",
      "Cost: On-demand compute represents 24% of subscription spend.",
      "Pricing: 1-year reserved instance pricing offers a lower effective hourly rate.",
    ],
    assumptions: [
      "Production workloads remain on the same VM family for the reservation term.",
      "No major scale-down is planned in the next quarter.",
    ],
    risks: [
      "Future architecture changes could reduce reservation utilization.",
    ],
    limitations: [
      "Savings estimate excludes software licensing and storage charges.",
    ],
    ruleLabel: "Last 30 days Rule: rec-vm-reservation v1",
  },
];

export const OPPORTUNITIES_OVERVIEW: OpportunitiesOverview = {
  metrics: [
    {
      id: "monthly-spend",
      label: "Currently Monthly Spend",
      value: "$18,421",
      hint: "+6.3% vs last month",
    },
    {
      id: "annual-savings",
      label: "Potential Annual Savings",
      value: "$18,421",
      hint: "+6.3% vs last month",
    },
  ],
  recommendations: [PRIMARY_RECOMMENDATION, ...ADDITIONAL_RECOMMENDATIONS],
};
