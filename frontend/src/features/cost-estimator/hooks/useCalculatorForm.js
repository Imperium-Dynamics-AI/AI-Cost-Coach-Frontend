import { useCallback, useEffect, useState } from "react";
import { createInitialFormValues } from "../config/calculatorConfig";

const DRAFT_STORAGE_KEY = "azure-cost-coach:estimate-draft:v2";
const DRAFT_SCHEMA_VERSION = 2;
const LAST_STEP_INDEX = 5;

function updateNestedValue(source, path, value) {
  const keys = path.split(".");
  const next = { ...source };
  let cursor = next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    cursor[key] = { ...cursor[key] };
    cursor = cursor[key];
  });

  return next;
}

function mergeDraftAnswers(savedAnswers) {
  const defaults = createInitialFormValues();

  return {
    openai: { ...defaults.openai, ...savedAnswers?.openai },
    rag: { ...defaults.rag, ...savedAnswers?.rag },
    storage: { ...defaults.storage, ...savedAnswers?.storage },
    compute: { ...defaults.compute, ...savedAnswers?.compute },
    global: { ...defaults.global, ...savedAnswers?.global },
  };
}

function loadDraft() {
  const fallback = {
    values: createInitialFormValues(),
    currentStep: 0,
    restored: false,
  };

  try {
    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      return fallback;
    }

    const savedDraft = JSON.parse(rawDraft);

    if (savedDraft.schemaVersion !== DRAFT_SCHEMA_VERSION) {
      return fallback;
    }

    return {
      values: mergeDraftAnswers(savedDraft.answers),
      currentStep: Math.min(
        Math.max(Number(savedDraft.currentStep) || 0, 0),
        LAST_STEP_INDEX,
      ),
      restored: true,
    };
  } catch {
    return fallback;
  }
}

export function useCalculatorForm() {
  const [formState, setFormState] = useState(loadDraft);

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            schemaVersion: DRAFT_SCHEMA_VERSION,
            currentStep: formState.currentStep,
            updatedAt: new Date().toISOString(),
            answers: formState.values,
          }),
        );
      } catch {
        // The form continues in memory when browser storage is unavailable.
      }
    }, 350);

    return () => window.clearTimeout(saveTimer);
  }, [formState.currentStep, formState.values]);

  const setValue = useCallback((path, value) => {
    setFormState((current) => ({
      ...current,
      values: updateNestedValue(current.values, path, value),
    }));
  }, []);

  const setCurrentStep = useCallback((step) => {
    setFormState((current) => ({
      ...current,
      currentStep: Math.min(Math.max(step, 0), LAST_STEP_INDEX),
    }));
  }, []);

  const resetForm = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Reset still works in memory when browser storage is unavailable.
    }

    setFormState({
      values: createInitialFormValues(),
      currentStep: 0,
      restored: false,
    });
  }, []);

  return {
    values: formState.values,
    currentStep: formState.currentStep,
    draftRestored: formState.restored,
    setValue,
    setCurrentStep,
    resetForm,
  };
}
