import { useCallback, useRef, useState } from "react";
import { requestCostEstimate } from "../api/costEstimateApi";

export function useCostEstimate() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const calculate = useCallback(async (payload) => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setStatus("loading");
    setResult(null);
    setError("");

    try {
      const response = await requestCostEstimate(payload);

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
          : "The estimate could not be requested. Please try again.",
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

  return { status, result, error, calculate, reset };
}
