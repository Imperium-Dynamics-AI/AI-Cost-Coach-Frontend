import type {
  DashboardOverview,
  NavItem,
  SpendRange,
  SpendSeries,
} from "@/features/dashboard/types/dashboard";

export const DASHBOARD_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "opportunities", label: "Opportunities", href: "/opportunities" },
  { id: "planner", label: "Planner", href: "/planner" },
  { id: "ai-coach", label: "AI Coach", href: "/ai-coach" },
  { id: "settings", label: "Settings", href: "/settings" },
];

export const DASHBOARD_OVERVIEW: DashboardOverview = {
  kpis: [
    {
      id: "monthly-spend",
      label: "Currently Monthly Spend",
      value: "$18,421",
      hint: "+6.3% vs last month",
    },
    {
      id: "monthly-savings",
      label: "Potential Monthly Savings",
      value: "$18,421",
      hint: "$37,445/year",
    },
    {
      id: "resources",
      label: "Resources",
      value: "142",
      hint: "18 AI resources",
    },
    {
      id: "high-priority",
      label: "High-Priority Recommendations",
      value: "05",
      hint: "",
    },
  ],
  highestCostResources: [
    {
      id: "res-1",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 92,
    },
    {
      id: "res-2",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 58,
    },
    {
      id: "res-3",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 14,
    },
    {
      id: "res-4",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 48,
    },
    {
      id: "res-5",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 36,
    },
    {
      id: "res-6",
      title: "aoai-prod-eastus",
      subtitle: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 32,
    },
  ],
  topServices: [
    {
      id: "svc-vm",
      title: "Virtual Machines",
      amountLabel: "$6,120",
      percent: 42,
    },
    {
      id: "svc-sql",
      title: "Azure SQL Database",
      amountLabel: "$6,120",
      percent: 52,
    },
    {
      id: "svc-storage",
      title: "Storage",
      amountLabel: "$6,120",
      percent: 16,
    },
    {
      id: "svc-openai",
      title: "Azure OpenAI",
      amountLabel: "$6,120",
      percent: 48,
    },
    {
      id: "svc-app",
      title: "App Service",
      amountLabel: "$6,120",
      percent: 44,
    },
  ],
  topSubscriptions: [
    {
      id: "sub-core",
      title: "prod-core",
      amountLabel: "$6,120",
      percent: 38,
    },
    {
      id: "sub-data",
      title: "data-platform",
      amountLabel: "$6,120",
      percent: 52,
    },
    {
      id: "sub-eu",
      title: "prod-eu",
      amountLabel: "$6,120",
      percent: 16,
    },
    {
      id: "sub-nonprod",
      title: "nonprod-dev",
      amountLabel: "$6,120",
      percent: 22,
    },
    {
      id: "sub-sandbox",
      title: "sandbox",
      amountLabel: "$6,120",
      percent: 18,
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "Switch GPT-4.1 → GPT-4.1 Mini",
      description:
        "Workload characteristics indicate the smaller model may satisfy the supported workload",
      confidence: "high",
      currentLabel: "$1,200/mo",
      projectedLabel: "$650/mo",
      savingsLabel: "$550/mo",
      href: "/opportunities",
    },
    {
      id: "rec-2",
      title: "Switch GPT-4.1 → GPT-4.1 Mini",
      description:
        "Workload characteristics indicate the smaller model may satisfy the supported workload",
      confidence: "medium",
      currentLabel: "$1,200/mo",
      projectedLabel: "$650/mo",
      savingsLabel: "$550/mo",
      href: "/opportunities",
    },
    {
      id: "rec-3",
      title: "Switch GPT-4.1 → GPT-4.1 Mini",
      description:
        "Workload characteristics indicate the smaller model may satisfy the supported workload",
      confidence: "high",
      currentLabel: "$1,200/mo",
      projectedLabel: "$650/mo",
      savingsLabel: "$550/mo",
      href: "/opportunities",
    },
  ],
};

const DAILY_VALUES = [
  42, 48, 46, 51, 55, 52, 49, 58, 62, 57, 53, 60, 68, 72, 70, 66, 74, 80, 86,
  82, 78, 88, 94, 90, 85, 92, 98, 96, 91, 88,
];

export const SPEND_SERIES: Record<SpendRange, SpendSeries> = {
  daily: {
    range: "daily",
    points: DAILY_VALUES.map((value, index) => ({
      label: `Day ${index + 1}`,
      value,
    })),
  },
  weekly: {
    range: "weekly",
    points: [
      { label: "Mon", value: 48 },
      { label: "Tue", value: 62 },
      { label: "Wed", value: 55 },
      { label: "Thu", value: 71 },
      { label: "Fri", value: 84 },
      { label: "Sat", value: 60 },
      { label: "Sun", value: 52 },
    ],
  },
  monthly: {
    range: "monthly",
    points: [
      { label: "Jan", value: 44 },
      { label: "Feb", value: 51 },
      { label: "Mar", value: 47 },
      { label: "Apr", value: 63 },
      { label: "May", value: 70 },
      { label: "Jun", value: 66 },
      { label: "Jul", value: 78 },
      { label: "Aug", value: 86 },
      { label: "Sep", value: 74 },
      { label: "Oct", value: 81 },
      { label: "Nov", value: 90 },
      { label: "Dec", value: 84 },
    ],
  },
};

export function breadcrumbForPath(pathname: string): [string, string] {
  if (pathname.startsWith("/dashboard")) {
    return ["Overview", "Resources"];
  }

  const match = DASHBOARD_NAV.find((item) => pathname.startsWith(item.href));
  return ["Overview", match?.label ?? "Dashboard"];
}
