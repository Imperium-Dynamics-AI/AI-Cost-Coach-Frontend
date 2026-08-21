"use client";

import { useCallback, useEffect, useState } from "react";
import { plannerApi } from "@/features/planner/api";
import { getErrorMessage } from "@/features/auth/api/errors";
import { PLANNER_CONFIG } from "@/features/planner/config/plannerConfig";
import type {
  PlannerEstimate,
  PlannerFormState,
  PlannerStep,
  PlannerWizardContent,
} from "@/features/planner/types/planner";
import { mergePlannerForm } from "@/features/planner/utils/plannerEstimate";

type StoredPlannerState = {
  currentStep: PlannerStep;
  form: PlannerFormState;
};

function readStoredState(): StoredPlannerState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PLANNER_CONFIG.storageKey);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredPlannerState;
  } catch {
    return null;
  }
}

function writeStoredState(state: StoredPlannerState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLANNER_CONFIG.storageKey, JSON.stringify(state));
}

export function usePlannerWizard() {
  const [content, setContent] = useState<PlannerWizardContent | null>(null);
  const [currentStep, setCurrentStep] = useState<PlannerStep>(1);
  const [form, setForm] = useState<PlannerFormState | null>(null);
  const [estimate, setEstimate] = useState<PlannerEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const wizardContent = await plannerApi.getWizardContent();
        if (cancelled) {
          return;
        }

        const stored = readStoredState();
        const initialForm = mergePlannerForm(stored?.form ?? wizardContent.defaultForm);
        const initialStep = stored?.currentStep ?? 1;

        setContent(wizardContent);
        setForm(initialForm);
        setCurrentStep(initialStep);
        setError(null);

        const initialEstimate = await plannerApi.calculateEstimate(initialForm);
        if (!cancelled) {
          setEstimate(initialEstimate);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught, "Unable to load planner."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshEstimate = useCallback(async (nextForm: PlannerFormState) => {
    setIsCalculating(true);
    try {
      const nextEstimate = await plannerApi.calculateEstimate(nextForm);
      setEstimate(nextEstimate);
      setError(null);
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to refresh estimate."));
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const updateForm = useCallback(
    (patch: Partial<PlannerFormState>) => {
      setForm((current) => {
        if (!current) {
          return current;
        }

        const nextForm = { ...current, ...patch };
        writeStoredState({ currentStep, form: nextForm });
        void refreshEstimate(nextForm);
        return nextForm;
      });
    },
    [currentStep, refreshEstimate],
  );

  const goToStep = useCallback(
    (step: PlannerStep) => {
      setCurrentStep(step);
      if (form) {
        writeStoredState({ currentStep: step, form });
      }
    },
    [form],
  );

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as PlannerStep);
    }
  }, [currentStep, goToStep]);

  const goNext = useCallback(() => {
    if (currentStep < 6) {
      goToStep((currentStep + 1) as PlannerStep);
    }
  }, [currentStep, goToStep]);

  const startOver = useCallback(() => {
    if (!content) {
      return;
    }

    const resetForm = mergePlannerForm(content.defaultForm);
    setForm(resetForm);
    setCurrentStep(1);
    writeStoredState({ currentStep: 1, form: resetForm });
    void refreshEstimate(resetForm);
  }, [content, refreshEstimate]);

  useEffect(() => {
    if (form) {
      writeStoredState({ currentStep, form });
    }
  }, [currentStep, form]);

  return {
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
  };
}
