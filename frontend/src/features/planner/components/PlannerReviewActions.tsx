type PlannerReviewActionsProps = {
  onBack: () => void;
  onStartOver: () => void;
  onContinue: () => void;
};

export function PlannerReviewActions({
  onBack,
  onStartOver,
  onContinue,
}: PlannerReviewActionsProps) {
  return (
    <div className="space-y-4 border-t border-[#E4D7F7] pt-5">
      <p className="text-sm text-navy">Answer are saved automatically in this browser.</p>

      <div className="flex flex-col gap-3 lg:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-full border-2 border-[#8C52FB61] bg-[#8C52FB] px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7A45E8]"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onStartOver}
          className="cursor-pointer rounded-full border-2 border-[#8C52FB61] bg-transparent px-10 py-3.5 text-sm font-semibold text-[#8C52FB] transition hover:bg-[#8C52FB14]"
        >
          Start Over
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="min-w-0 flex-1 cursor-pointer rounded-full border-[0.83px] border-[#8C52FB61] bg-[#8C52FB33] px-8 py-3.5 text-sm font-semibold text-navy transition hover:bg-[#8C52FB40]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
