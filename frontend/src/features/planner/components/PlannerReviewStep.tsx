"use client";

import { useEffect, useState } from "react";
import { plannerApi } from "@/features/planner/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import { PlannerReviewAssumptions } from "@/features/planner/components/PlannerReviewAssumptions";
import type {
  PlannerFormState,
  PlannerStep,
  PlannerWizardContent,
} from "@/features/planner/types/planner";
import { buildPlannerReviewRows } from "@/features/planner/utils/plannerReview";

type PlannerReviewStepProps = {
  content: PlannerWizardContent;
  form: PlannerFormState;
  onGoToStep: (step: PlannerStep) => void;
};

export function PlannerReviewStep({ content, form, onGoToStep }: PlannerReviewStepProps) {
  return (
    <PlannerReviewAssumptions
      rows={buildPlannerReviewRows(form, content)}
      onEdit={onGoToStep}
    />
  );
}
