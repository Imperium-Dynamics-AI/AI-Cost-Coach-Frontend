import { PLANNER_ESTIMATE_BANNER } from "@/features/planner/data/plannerDummyData";

export function PlannerEstimateBanner() {
  return (
    <div className="rounded-2xl border border-[#8C52FB3B] bg-[#FFFFFF12] px-4 py-3 md:px-5">
      <p className="text-sm leading-relaxed text-[#8C52FB] md:text-base">
        <span className="font-bold text-navy">Live Browser Estimate:</span>{" "}
        {PLANNER_ESTIMATE_BANNER.replace("Live Browser Estimate: ", "")}
      </p>
    </div>
  );
}
