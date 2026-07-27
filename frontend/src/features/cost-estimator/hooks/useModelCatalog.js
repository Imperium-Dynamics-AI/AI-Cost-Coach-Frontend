import { useCallback, useEffect, useRef, useState } from "react";
import { requestModelCatalog } from "../api/modelComparisonApi";

export function useModelCatalog() {
  const [status, setStatus] = useState("loading");
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setStatus("loading");
    setError("");

    try {
      const response = await requestModelCatalog();

      if (requestId.current !== currentRequestId) {
        return;
      }

      setCatalog(response);
      setStatus("success");
    } catch (requestError) {
      if (requestId.current !== currentRequestId) {
        return;
      }

      setCatalog(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Model pricing could not be loaded. Please try again.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();

    return () => {
      requestId.current += 1;
    };
  }, [load]);

  return { status, catalog, error, reload: load };
}
