import { COST_CATEGORIES } from "../config/calculatorConfig";

function formatCurrency(value, currency = "USD", digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function ScenarioTabs({ scenarios, activeScenarioId, onScenarioChange }) {
  return (
    <div
      className={`scenario-tabs scenario-tabs--${scenarios.length}`}
      role="tablist"
      aria-label="Configuration comparison options"
    >
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          id={`scenario-tab-${scenario.id}`}
          type="button"
          role="tab"
          aria-selected={activeScenarioId === scenario.id}
          aria-controls={`scenario-panel-${scenario.id}`}
          className={`scenario-tab${
            activeScenarioId === scenario.id ? " scenario-tab--active" : ""
          }`}
          onClick={() => onScenarioChange(scenario.id)}
        >
          <span className="scenario-tab__eyebrow">{scenario.label}</span>
          <strong>{scenario.name}</strong>
          <span className="scenario-tab__description">{scenario.role}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="result-state result-state--empty">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 8h28v32H10z" />
        <path d="M16 16h16M16 23h16M16 30h7" />
      </svg>
      <h2>Your options will appear here</h2>
      <p>Complete the guided questions to compare the available configurations.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="result-state" role="status" aria-live="polite">
      <span className="spinner spinner--large" aria-hidden="true" />
      <h2>Comparing your options</h2>
      <p>The pricing service is calculating each available configuration.</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="result-state result-state--error" role="alert">
      <h2>We couldn’t prepare the estimate</h2>
      <p>{message}</p>
    </div>
  );
}

function ReceiptLine({ label, value, currency }) {
  return (
    <div className="receipt-line">
      <span>{label}</span>
      <span>{formatCurrency(value, currency)}</span>
    </div>
  );
}

function ResultsTable({ result, scenarios }) {
  return (
    <section className="comparison-card" aria-labelledby="comparison-heading">
      <div className="card-heading-row">
        <div>
          <span className="eyebrow">Same usage assumptions</span>
          <h2 id="comparison-heading">Compare configuration options</h2>
        </div>
        {Number.isFinite(result.totalMonthlyRequests) ? (
          <span className="request-summary">
            {new Intl.NumberFormat("en-US").format(result.totalMonthlyRequests)} interactions/month
          </span>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">Monthly</th>
              <th scope="col">Annual</th>
              <th scope="col">Per person</th>
              <th scope="col">Per interaction</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => {
              const estimate = result.scenarios?.[scenario.id];
              const isLowest = result.cheapestId === scenario.id;

              return (
                <tr key={scenario.id} className={isLowest ? "comparison-row--best" : ""}>
                  <th scope="row">
                    <span>{scenario.name}</span>
                    <small>
                      {scenario.label} · {scenario.role}
                      {isLowest ? " · Lowest estimate" : ""}
                    </small>
                  </th>
                  <td>{formatCurrency(estimate?.monthlyTotal, result.currency)}</td>
                  <td>{formatCurrency(estimate?.annualTotal, result.currency)}</td>
                  <td>{formatCurrency(estimate?.costPerUser, result.currency, 3)}</td>
                  <td>
                    {formatCurrency(estimate?.costPerConversation, result.currency, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EstimateReceipt({
  result,
  scenarios,
  activeScenarioId,
  computeEnabled,
  growthPct,
}) {
  const activeScenario = scenarios.find(
    (scenario) => scenario.id === activeScenarioId,
  );
  const estimate = result.scenarios?.[activeScenario?.id];

  if (!estimate) {
    return <ErrorState message="The pricing service did not return this comparison option." />;
  }

  const includedCategories = COST_CATEGORIES.filter(
    (category) =>
      category.availability === "always" ||
      (category.availability === "rag" && activeScenario.forceRag) ||
      (category.availability === "compute" && computeEnabled),
  );

  return (
    <>
      {result.placeholder ? (
        <div className="preview-callout" role="status">
          <strong>Your answers were recorded.</strong>
          <span>All comparison options are ready for the backend pricing service.</span>
        </div>
      ) : null}

      {result.warnings?.length ? (
        <div className="warning-callout">
          <strong>Some values need attention</strong>
          <ul>
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section
        id={`scenario-panel-${activeScenario.id}`}
        className="estimate-card"
        role="tabpanel"
        aria-labelledby={`scenario-tab-${activeScenario.id}`}
      >
        <div className="estimate-card__heading">
          <div>
            <span className="eyebrow">{activeScenario.role}</span>
            <h2>{estimate.name}</h2>
          </div>
          <span className="estimate-card__option">{activeScenario.label}</span>
        </div>

        {result.totalMonthlyRequests !== null ? (
          <div className="request-volume">
            <span>Estimated usage</span>
            <strong>
              {new Intl.NumberFormat("en-US").format(result.totalMonthlyRequests)} AI
              interactions/month
            </strong>
          </div>
        ) : null}

        <div className="receipt-lines">
          {includedCategories.map((category) => (
            <ReceiptLine
              key={category.key}
              label={category.label}
              value={estimate.breakdown?.[category.key]}
              currency={result.currency}
            />
          ))}
        </div>

        <div className="estimate-total">
          <span>Estimated monthly cost</span>
          <strong>{formatCurrency(estimate.monthlyTotal, result.currency)}</strong>
        </div>

        <dl className="estimate-metrics">
          <div>
            <dt>Estimated annual cost</dt>
            <dd>{formatCurrency(estimate.annualTotal, result.currency)}</dd>
          </div>
          <div>
            <dt>Cost per person</dt>
            <dd>{formatCurrency(estimate.costPerUser, result.currency, 3)}</dd>
          </div>
          <div>
            <dt>Cost per AI interaction</dt>
            <dd>{formatCurrency(estimate.costPerConversation, result.currency, 4)}</dd>
          </div>
          <div>
            <dt>Next month with {growthPct}% growth</dt>
            <dd>{formatCurrency(estimate.nextMonthProjected, result.currency)}</dd>
          </div>
        </dl>
      </section>

      <ResultsTable result={result} scenarios={scenarios} />
    </>
  );
}

export function EstimateResults({
  status,
  result,
  error,
  scenarios,
  activeScenarioId,
  onScenarioChange,
  computeEnabled,
  growthPct,
}) {
  return (
    <div className="results-panel">
      {status === "idle" ? <EmptyState /> : null}
      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? <ErrorState message={error} /> : null}
      {status === "success" && result && scenarios.length >= 2 ? (
        <>
          <ScenarioTabs
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onScenarioChange={onScenarioChange}
          />
          <EstimateReceipt
            result={result}
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            computeEnabled={computeEnabled}
            growthPct={growthPct}
          />
        </>
      ) : null}
    </div>
  );
}
