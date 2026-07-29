import { useEffect, useMemo, useState } from "react";
import { CalculatorForm } from "./components/CalculatorForm";
import { EstimateResults } from "./components/EstimateResults";
import { USING_PLACEHOLDER_API } from "./api/modelComparisonApi";
import { useCalculatorForm } from "./hooks/useCalculatorForm";
import { useModelComparisons } from "./hooks/useModelComparisons";
import { useModelCatalog } from "./hooks/useModelCatalog";
import { buildModelComparisonPayload } from "./utils/buildModelComparisonPayload";
import { calculateLocalEstimate } from "./utils/calculateLocalEstimate";

const EMPTY_MODELS = [];

export function CostEstimatorPage() {
  const [activeComparisonId, setActiveComparisonId] = useState(null);
  const {
    values,
    currentStep,
    draftRestored,
    setValue,
    setCurrentStep,
    resetForm,
  } = useCalculatorForm();
  const { status, result, error, compare, reportError, reset } = useModelComparisons();
  const {
    status: catalogStatus,
    catalog,
    error: catalogError,
    reload: reloadCatalog,
  } = useModelCatalog();
  const models = catalog?.models ?? EMPTY_MODELS;
  const liveEstimate = useMemo(
    () => calculateLocalEstimate(values, catalog),
    [catalog, values],
  );

  useEffect(() => {
    if (status !== "success" || !result?.comparisons?.length) {
      return;
    }

    setActiveComparisonId(result.comparisons[0].id);
  }, [result, status]);

  const handleValueChange = (path, value) => {
    setValue(path, value);
    setActiveComparisonId(null);
    reset();
  };

  const handleSubmit = () => {
    setActiveComparisonId(null);
    try {
      compare(buildModelComparisonPayload(values, models, catalog));
    } catch (submissionError) {
      reportError(submissionError);
    }
  };

  const handleReset = () => {
    resetForm();
    setActiveComparisonId(null);
    reset();
  };

  return (
    <main className="app-shell">
      <div className="page-container">
        <header className="page-header">
          <div>
            <span className="page-header__kicker">Azure planning tool</span>
            <h1>Build your AI cost estimate</h1>
            <p>
              Answer a few business questions and we’ll turn your choices into a clear
              Azure AI cost estimate.
            </p>
          </div>
          <div className="page-header__badge" aria-label="All estimates are in US dollars">
            <span>Currency</span>
            <strong>USD</strong>
          </div>
        </header>

        {USING_PLACEHOLDER_API ? (
          <div className="connection-notice">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" />
              <path d="M10 8v5M10 5.8h.01" />
            </svg>
            <p>
              <strong>Preview mode:</strong> you can review and submit every input now.
              Live values use sample prices; final comparison costs require the real
              pricing service.
            </p>
          </div>
        ) : null}

        <div className="calculator-layout">
          <CalculatorForm
            values={values}
            setValue={handleValueChange}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            draftRestored={draftRestored}
            onSubmit={handleSubmit}
            onReset={handleReset}
            status={status}
            models={models}
            catalogStatus={catalogStatus}
            catalogError={catalogError}
            catalogCurrency={catalog?.currency}
            catalogRegion={catalog?.region}
            onReloadCatalog={reloadCatalog}
          />
          <EstimateResults
            status={status}
            result={result}
            error={error}
            activeComparisonId={activeComparisonId}
            onComparisonChange={setActiveComparisonId}
            growthPct={values.global.growthPct}
            liveEstimate={liveEstimate}
            catalogStatus={catalogStatus}
            catalogError={catalogError}
          />
        </div>

        <footer className="page-footer">
          Estimates are planning guidance, not an Azure quote. Actual charges depend on
          region, negotiated pricing, usage patterns, and Microsoft’s current rates.
        </footer>
      </div>
    </main>
  );
}
