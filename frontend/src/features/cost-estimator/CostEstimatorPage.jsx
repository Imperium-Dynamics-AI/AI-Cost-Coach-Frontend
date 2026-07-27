import { useState } from "react";
import { CalculatorForm } from "./components/CalculatorForm";
import { EstimateResults } from "./components/EstimateResults";
import { USING_PLACEHOLDER_API } from "./api/costEstimateApi";
import { useCalculatorForm } from "./hooks/useCalculatorForm";
import { useCostEstimate } from "./hooks/useCostEstimate";
import { buildEstimatePayload } from "./utils/buildEstimatePayload";
import { createComparisonScenarios } from "./config/calculatorConfig";

export function CostEstimatorPage() {
  const [activeScenarioId, setActiveScenarioId] = useState("A");
  const {
    values,
    currentStep,
    draftRestored,
    setValue,
    setCurrentStep,
    resetForm,
  } = useCalculatorForm();
  const { status, result, error, calculate, reset } = useCostEstimate();
  const scenarios = createComparisonScenarios(values);

  const handleValueChange = (path, value) => {
    setValue(path, value);
    setActiveScenarioId("A");
    reset();
  };

  const handleSubmit = () => {
    setActiveScenarioId("A");
    calculate(buildEstimatePayload(values));
  };

  const handleReset = () => {
    resetForm();
    setActiveScenarioId("A");
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
              Cost values will populate when the pricing service is connected.
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
          />
          <EstimateResults
            status={status}
            result={result}
            error={error}
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onScenarioChange={setActiveScenarioId}
            computeEnabled={values.compute.enabled}
            growthPct={values.global.growthPct}
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
