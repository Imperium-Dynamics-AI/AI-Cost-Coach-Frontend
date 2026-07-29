import { useCallback, useEffect, useRef, useState } from "react";
import { requestModelComparisons } from "../api/modelComparisonApi";

function comparisonErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Model comparisons could not be requested. Please try again.";
}

export function useModelComparisons() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const compare = useCallback(async (payload) => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setStatus("loading");
    setResult(null);
    setError("");

    try {
      const response = await requestModelComparisons(payload);

      if (requestId.current !== currentRequestId) {
        return;
      }

      setResult(response);
      setStatus("success");
    } catch (requestError) {
      if (requestId.current !== currentRequestId) {
        return;
      }

      setError(
        comparisonErrorMessage(requestError),
      );
      setStatus("error");
    }
  }, []);

  const reportError = useCallback((requestError) => {
    requestId.current += 1;
    setResult(null);
    setError(comparisonErrorMessage(requestError));
    setStatus("error");
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setStatus("idle");
    setResult(null);
    setError("");
  }, []);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  return { status, result, error, compare, reportError, reset };
}
