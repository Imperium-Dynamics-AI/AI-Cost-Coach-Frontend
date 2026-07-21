import { RESOURCE_OPTIONS } from "../config/calculatorConfig";

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

function ScenarioTabs({ scenarios, activeTab, onTabChange }) {
  return (
    <div className="scenario-tabs" role="tablist" aria-label="Cost comparison options">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          id={`scenario-tab-${scenario.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === scenario.id}
          aria-controls={`scenario-panel-${scenario.id}`}
          className={`scenario-tab${activeTab === scenario.id ? " scenario-tab--active" : ""}`}
          onClick={() => onTabChange(scenario.id)}
        >
          <span className="scenario-tab__eyebrow">{scenario.label}</span>
          <strong>{scenario.name}</strong>
          <span className="scenario-tab__description">{scenario.description}</span>
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
      <h2>Your comparison will appear here</h2>
      <p>
        Choose the parts of your solution, enter your expected usage, and select
        <strong> Estimate and compare monthly cost</strong>.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="result-state" role="status" aria-live="polite">
      <span className="spinner spinner--large" aria-hidden="true" />
      <h2>Preparing your comparison</h2>
      <p>The pricing service is reviewing the assumptions for all three options.</p>
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
          <span className="eyebrow">At a glance</span>
          <h2 id="comparison-heading">Compare all options</h2>
        </div>
        {result.totalMonthlyRequests !== null ? (
          <span className="request-summary">
            {new Intl.NumberFormat("en-US").format(result.totalMonthlyRequests)} requests/month
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
              const scenarioResult = result.scenarios[scenario.id];
              const isCheapest = result.cheapestId === scenario.id;

              return (
                <tr key={scenario.id} className={isCheapest ? "comparison-row--best" : ""}>
                  <th scope="row">
                    <span>{scenario.name}</span>
                    {isCheapest ? <small>Lowest estimate</small> : null}
                  </th>
                  <td>{formatCurrency(scenarioResult?.monthlyTotal, result.currency)}</td>
                  <td>{formatCurrency(scenarioResult?.annualTotal, result.currency)}</td>
                  <td>{formatCurrency(scenarioResult?.costPerUser, result.currency, 3)}</td>
                  <td>
                    {formatCurrency(scenarioResult?.costPerConversation, result.currency, 4)}
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

function EstimateReceipt({ result, scenarios, activeTab, resources, growthPct }) {
  const activeScenario = result.scenarios[activeTab];
  const scenarioConfig = scenarios.find((scenario) => scenario.id === activeTab);

  if (!activeScenario) {
    return <ErrorState message="The pricing service did not return this comparison option." />;
  }

  const includedResources = RESOURCE_OPTIONS.filter(
    (resource) =>
      resources[resource.key] || (scenarioConfig?.forceRag && resource.key === "rag"),
  );

  return (
    <>
      {result.placeholder ? (
        <div className="preview-callout" role="status">
          <strong>Inputs are ready for review.</strong>
          <span>
            Cost values will appear here after the backend pricing service is connected.
          </span>
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
        id={`scenario-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`scenario-tab-${activeTab}`}
        className="estimate-card"
      >
        <div className="estimate-card__heading">
          <div>
            <span className="eyebrow">Estimated Azure spend</span>
            <h2>{activeScenario.name} each month</h2>
          </div>
          <span className="estimate-card__option">{scenarioConfig?.label}</span>
        </div>

        <div className="receipt-lines">
          {includedResources.map((resource) => (
            <ReceiptLine
              key={resource.key}
              label={resource.label}
              value={activeScenario.breakdown?.[resource.key]}
              currency={result.currency}
            />
          ))}
        </div>

        <div className="estimate-total">
          <span>Estimated monthly cost</span>
          <strong>{formatCurrency(activeScenario.monthlyTotal, result.currency)}</strong>
        </div>

        <dl className="estimate-metrics">
          <div>
            <dt>Estimated annual cost</dt>
            <dd>{formatCurrency(activeScenario.annualTotal, result.currency)}</dd>
          </div>
          <div>
            <dt>Cost per person</dt>
            <dd>{formatCurrency(activeScenario.costPerUser, result.currency, 3)}</dd>
          </div>
          <div>
            <dt>Cost per AI interaction</dt>
            <dd>{formatCurrency(activeScenario.costPerConversation, result.currency, 4)}</dd>
          </div>
          <div>
            <dt>Next month with {growthPct}% growth</dt>
            <dd>{formatCurrency(activeScenario.nextMonthProjected, result.currency)}</dd>
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
  activeTab,
  onTabChange,
  resources,
  growthPct,
}) {
  return (
    <div className="results-panel">
      <ScenarioTabs
        scenarios={scenarios}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {status === "idle" ? <EmptyState /> : null}
      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? <ErrorState message={error} /> : null}
      {status === "success" && result ? (
        <EstimateReceipt
          result={result}
          scenarios={scenarios}
          activeTab={activeTab}
          resources={resources}
          growthPct={growthPct}
        />
      ) : null}
    </div>
  );
}
