import { useCallback, useRef, useState } from "react";
import { requestModelComparisons } from "../api/modelComparisonApi";

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
        requestError instanceof Error
          ? requestError.message
          : "Model comparisons could not be requested. Please try again.",
      );
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setStatus("idle");
    setResult(null);
    setError("");
  }, []);

  return { status, result, error, compare, reset };
}
