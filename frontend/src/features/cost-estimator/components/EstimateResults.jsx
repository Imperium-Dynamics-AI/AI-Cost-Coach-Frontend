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

function formatRelationship(value) {
  if (!value) {
    return "Backend comparison";
  }

  return value.replaceAll(/[-_]/g, " ");
}

// Both differences are relative to the selected model, not the cheapest —
// "Baseline" always means "what you picked," so a pricier alternative
// still reads clearly as "+$X more" rather than implying it's the odd one out.
function formatDollarDifference(monthlyTotal, baselineTotal, currency) {
  if (!Number.isFinite(monthlyTotal) || !Number.isFinite(baselineTotal)) {
    return "—";
  }

  const diff = monthlyTotal - baselineTotal;
  if (Math.abs(diff) < 0.005) {
    return "Baseline";
  }

  const amount = formatCurrency(Math.abs(diff), currency);
  return diff < 0 ? `Save ${amount}/mo` : `+${amount}/mo`;
}

function formatPercentDifference(monthlyTotal, baselineTotal) {
  if (!Number.isFinite(monthlyTotal) || !Number.isFinite(baselineTotal) || baselineTotal === 0) {
    return "—";
  }

  const diff = monthlyTotal - baselineTotal;
  if (Math.abs(diff) < 0.005) {
    return "Baseline";
  }

  const pct = Math.abs(diff / baselineTotal) * 100;
  return diff < 0 ? `${pct.toFixed(0)}% cheaper` : `${pct.toFixed(0)}% more`;
}

function ComparisonTabs({ comparisons, activeComparisonId, onComparisonChange }) {
  return (
    <div
      className={`scenario-tabs scenario-tabs--${comparisons.length}`}
      role="tablist"
      aria-label="Model comparison options"
    >
      {comparisons.map((comparison) => (
        <button
          key={comparison.id}
          id={`comparison-tab-${comparison.id}`}
          type="button"
          role="tab"
          aria-selected={activeComparisonId === comparison.id}
          aria-controls={`comparison-panel-${comparison.id}`}
          className={`scenario-tab${
            activeComparisonId === comparison.id ? " scenario-tab--active" : ""
          }`}
          onClick={() => onComparisonChange(comparison.id)}
        >
          <span className="scenario-tab__eyebrow">{comparison.label}</span>
          <strong>{comparison.model.name}</strong>
          <span className="scenario-tab__description">{comparison.reason}</span>
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
      <h2>Your estimate will appear here</h2>
      <p>
        Select a model to see its live cost. Related model comparisons are requested only
        after your final review.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="result-state" role="status" aria-live="polite">
      <span className="spinner spinner--large" aria-hidden="true" />
      <h2>Finding related models</h2>
      <p>
        The comparison service is selecting the model family and calculating each
        returned option.
      </p>
    </div>
  );
}

function CatalogLoadingState() {
  return (
    <div className="result-state" role="status" aria-live="polite">
      <span className="spinner spinner--large" aria-hidden="true" />
      <h2>Loading current prices</h2>
      <p>The model catalog is being prepared for live browser-side estimates.</p>
    </div>
  );
}

function ErrorState({ message, title = "We couldn’t prepare the comparisons" }) {
  return (
    <div className="result-state result-state--error" role="alert">
      <h2>{title}</h2>
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

function ResultsTable({ result, comparisons }) {
  const baseline = comparisons.find((c) => c.relationship === "selected") ?? comparisons[0];
  const baselineTotal = baseline?.estimate?.monthlyTotal;

  return (
    <section className="comparison-card" aria-labelledby="comparison-heading">
      <div className="card-heading-row">
        <div>
          <span className="eyebrow">Nearest-priced alternatives</span>
          <h2 id="comparison-heading">Compare returned models</h2>
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
              <th scope="col">Model</th>
              <th scope="col">Monthly</th>
              <th scope="col">Difference</th>
              <th scope="col">vs. selected</th>
              <th scope="col">Annual</th>
              <th scope="col">Per person</th>
              <th scope="col">Per interaction</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comparison) => {
              const estimate = comparison.estimate;
              const isLowest = result.cheapestId === comparison.id;
              const isBaseline = comparison.id === baseline?.id;

              return (
                <tr key={comparison.id} className={isLowest ? "comparison-row--best" : ""}>
                  <th scope="row">
                    <span>{comparison.model.name}</span>
                    <small>
                      {comparison.label} · {formatRelationship(comparison.relationship)}
                      {isLowest ? " · Lowest estimate" : ""}
                    </small>
                  </th>
                  <td>{formatCurrency(estimate.monthlyTotal, result.currency)}</td>
                  <td className={isBaseline ? "diff-baseline" : estimate.monthlyTotal < baselineTotal ? "diff-cheaper" : "diff-pricier"}>
                    {formatDollarDifference(estimate.monthlyTotal, baselineTotal, result.currency)}
                  </td>
                  <td className={isBaseline ? "diff-baseline" : estimate.monthlyTotal < baselineTotal ? "diff-cheaper" : "diff-pricier"}>
                    {formatPercentDifference(estimate.monthlyTotal, baselineTotal)}
                  </td>
                  <td>{formatCurrency(estimate.annualTotal, result.currency)}</td>
                  <td>{formatCurrency(estimate.costPerUser, result.currency, 3)}</td>
                  <td>
                    {formatCurrency(estimate.costPerConversation, result.currency, 4)}
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
  comparisons,
  activeComparisonId,
  growthPct,
  isLive = false,
  showComparison = true,
}) {
  const activeComparison =
    comparisons.find((comparison) => comparison.id === activeComparisonId) ??
    comparisons[0];
  const estimate = activeComparison?.estimate;

  if (!activeComparison || !estimate) {
    return <ErrorState message="The service did not return this comparison." />;
  }

  const includedCategories = COST_CATEGORIES.filter(
    (category) =>
      category.availability === "always" ||
      (category.availability === "rag" &&
        activeComparison.configuration.ragEnabled) ||
      (category.availability === "compute" &&
        activeComparison.configuration.computeEnabled),
  );

  return (
    <>
      {result.placeholder ? (
        <div className="preview-callout" role="status">
          <strong>Preview comparison only.</strong>
          <span>The backend will choose related models when its endpoint is connected.</span>
        </div>
      ) : null}

      {isLive ? (
        <div className="preview-callout" role="status">
          <strong>Live browser estimate.</strong>
          <span>
            This updates from the cached {result.region || "Azure"} prices as you answer.
            Unanswered service choices are not included yet.
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
        id={isLive ? undefined : `comparison-panel-${activeComparison.id}`}
        className="estimate-card"
        role={isLive ? undefined : "tabpanel"}
        aria-labelledby={
          isLive ? undefined : `comparison-tab-${activeComparison.id}`
        }
      >
        <div className="estimate-card__heading">
          <div>
            <span className="eyebrow">
              {isLive
                ? activeComparison.reason
                : formatRelationship(activeComparison.relationship)}
            </span>
            <h2>{estimate.name || activeComparison.model.name}</h2>
          </div>
          <span className="estimate-card__option">{activeComparison.label}</span>
        </div>

        {!isLive && activeComparison.reason ? (
          <p className="comparison-reason">{activeComparison.reason}</p>
        ) : null}

        {Number.isFinite(result.totalMonthlyRequests) ? (
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

      {showComparison ? (
        <ResultsTable result={result} comparisons={comparisons} />
      ) : null}
    </>
  );
}

function LiveEstimate({ estimate, growthPct }) {
  const comparison = {
    id: "live",
    label: "Live estimate",
    relationship: "selected",
    reason: "Your current selection",
    model: {
      id: "live",
      name: estimate.scenario.name,
    },
    configuration: {
      ragEnabled: estimate.assumptions.ragEnabled,
      computeEnabled: estimate.assumptions.computeEnabled,
    },
    estimate: estimate.scenario,
  };
  const result = {
    ...estimate,
    comparisons: [comparison],
  };

  return (
    <EstimateReceipt
      result={result}
      comparisons={result.comparisons}
      activeComparisonId="live"
      growthPct={growthPct}
      isLive
      showComparison={false}
    />
  );
}

export function EstimateResults({
  status,
  result,
  error,
  activeComparisonId,
  onComparisonChange,
  growthPct,
  liveEstimate,
  catalogStatus,
  catalogError,
}) {
  const resolvedActiveId =
    activeComparisonId ?? result?.comparisons?.[0]?.id ?? null;

  return (
    <div className="results-panel">
      {status === "idle" && catalogStatus === "loading" ? (
        <CatalogLoadingState />
      ) : null}
      {status === "idle" && catalogStatus === "error" ? (
        <ErrorState title="Current prices are unavailable" message={catalogError} />
      ) : null}
      {status === "idle" && catalogStatus === "success" && liveEstimate ? (
        <LiveEstimate estimate={liveEstimate} growthPct={growthPct} />
      ) : null}
      {status === "idle" && catalogStatus === "success" && !liveEstimate ? (
        <EmptyState />
      ) : null}
      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? <ErrorState message={error} /> : null}
      {status === "success" && result?.comparisons?.length ? (
        <>
          <ComparisonTabs
            comparisons={result.comparisons}
            activeComparisonId={resolvedActiveId}
            onComparisonChange={onComparisonChange}
          />
          <EstimateReceipt
            result={result}
            comparisons={result.comparisons}
            activeComparisonId={resolvedActiveId}
            growthPct={growthPct}
          />
        </>
      ) : null}
    </div>
  );
}
