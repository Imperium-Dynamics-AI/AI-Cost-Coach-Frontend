import { useCallback, useState } from "react";
import { createInitialFormValues } from "../config/calculatorConfig";

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

export function useCalculatorForm() {
  const [values, setValues] = useState(createInitialFormValues);

  const setValue = useCallback((path, value) => {
    setValues((current) => updateNestedValue(current, path, value));
  }, []);

  return {
    values,
    setValue,
  };
}
