"use client";

import { cn } from "@/shared/utils/cn";
import type {
  SpendPoint,
  SpendRange,
} from "@/features/dashboard/types/dashboard";

type SpendChartProps = {
  range: SpendRange;
  onRangeChange: (range: SpendRange) => void;
  points: SpendPoint[];
  isLoading?: boolean;
};

const RANGES: Array<{ id: SpendRange; label: string }> = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

function toSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const parts = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    parts.push(
      `C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`,
    );
  }

  return parts.join(" ");
}

export function SpendChart({
  range,
  onRangeChange,
  points,
  isLoading = false,
}: SpendChartProps) {
  const width = 800;
  const height = 320;
  const paddingTop = 12;
  const values = points.map((point) => point.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);

  const mapped = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * width;
    const y =
      paddingTop + (1 - (point.value - min) / span) * (height - paddingTop);
    return { x, y };
  });

  const linePath = toSmoothPath(mapped);
  const areaPath =
    mapped.length > 0
      ? `${linePath} L ${mapped[mapped.length - 1].x} ${height} L ${mapped[0].x} ${height} Z`
      : "";

  const gridLines = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <section className="app-box overflow-hidden rounded-2xl pt-5 md:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 md:px-6">
        <div>
          <p className="text-base font-bold text-[#19226880]">Cost Overview</p>
          <h3 className="mt-1 text-3xl font-bold text-navy">
            Daily Azure Spend
          </h3>
        </div>
        <div className="inline-flex items-center gap-0.5 rounded-[10px] border border-[#E8D9F5] bg-[#F3EAF766] p-1 shadow-[inset_0_1px_3px_rgba(151,93,194,0.14)]">
          {RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRangeChange(item.id)}
              className={cn(
                "cursor-pointer rounded-[7px] px-4 py-1 text-sm font-medium transition",
                range === item.id
                  ? "bg-[#A041F8] text-white shadow-sm"
                  : "text-[#4A3F6B] hover:text-navy",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72 w-full md:h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-base text-purple">
            Loading chart...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="Daily Azure spend chart"
          >
            {gridLines.map((line) => (
              <line
                key={line}
                x1="0"
                x2={width}
                y1={height * line}
                y2={height * line}
                stroke="#975DC2"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            ))}
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B57CFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#EFE7FF" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#spendFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#8C52FB"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </section>
  );
}
