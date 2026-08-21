"use client";

import { PlannerPageHeader } from "@/features/planner/components/PlannerPageHeader";
import { PlannerReviewActions } from "@/features/planner/components/PlannerReviewActions";
import { PlannerReviewComparisonSection } from "@/features/planner/components/PlannerReviewComparisonSection";
import { PlannerReviewStep } from "@/features/planner/components/PlannerReviewStep";
import { PlannerStepContent } from "@/features/planner/components/PlannerStepContent";
import { PlannerWizardActions } from "@/features/planner/components/PlannerWizardActions";
import { PlannerWizardShell } from "@/features/planner/components/PlannerWizardShell";
import { PlannerEstimateSummary } from "@/features/planner/components/PlannerEstimateSummary";
import { usePlannerWizard } from "@/features/planner/hooks/usePlannerWizard";

export function PlannerView() {
  const {
    content,
    currentStep,
    form,
    estimate,
    isLoading,
    isCalculating,
    error,
    updateForm,
    goBack,
    goNext,
    goToStep,
    startOver,
  } = usePlannerWizard();

  if (isLoading || !content || !form || !estimate) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-purple">
        Loading planner...
      </div>
    );
  }

  if (error && !estimate) {
    return (
      <div className="app-shell-box rounded-3xl px-6 py-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  const stepMeta = content.steps[currentStep - 1]!;
  const isReviewStep = currentStep === 6;

  function scrollToComparison() {
    document
      .getElementById("planner-comparison")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="space-y-6">
      <div className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
        <PlannerPageHeader />

        <PlannerWizardShell
          stepMeta={stepMeta}
          currentStep={currentStep}
          actions={
            isReviewStep ? (
              <PlannerReviewActions
                onBack={goBack}
                onStartOver={startOver}
                onContinue={scrollToComparison}
              />
            ) : (
              <PlannerWizardActions
                currentStep={currentStep}
                onBack={goBack}
                onContinue={goNext}
              />
            )
          }
        >
          {isReviewStep ? (
            <PlannerReviewStep content={content} form={form} onGoToStep={goToStep} />
          ) : (
            <PlannerStepContent
              stepMeta={stepMeta}
              content={content}
              form={form}
              onUpdate={updateForm}
            />
          )}
        </PlannerWizardShell>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {isReviewStep ? (
        <PlannerReviewComparisonSection
          form={form}
          estimate={estimate}
          isCalculating={isCalculating}
        />
      ) : (
        <PlannerEstimateSummary estimate={estimate} isCalculating={isCalculating} />
      )}
    </section>
  );
}
