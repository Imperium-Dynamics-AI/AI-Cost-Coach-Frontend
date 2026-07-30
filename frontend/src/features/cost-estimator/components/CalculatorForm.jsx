import { useEffect, useRef } from "react";
import { FormField } from "../../../shared/components/FormField";
import { NumberInput } from "../../../shared/components/NumberInput";
import { HELP_TEXT } from "../config/helpText";

const STEPS = [
  {
    id: "model",
    label: "AI model",
    title: "Which AI model would you like to start with?",
  },
  {
    id: "rag",
    label: "Business knowledge",
    title: "Should the AI answer using your business documents?",
  },
  { id: "usage", label: "Expected usage", title: "How much will the solution be used?" },
  {
    id: "content",
    label: "Content size",
    title: "How much text will each AI interaction use?",
  },
  {
    id: "planning",
    label: "Hosting and growth",
    title: "What supporting costs should the estimate include?",
  },
  { id: "review", label: "Review", title: "Review your assumptions" },
];

const PROMPT_PRESETS = [
  { label: "Short", value: 400 },
  { label: "Standard", value: 800 },
  { label: "Long", value: 2000 },
];

const RESPONSE_PRESETS = [
  { label: "Short", value: 150 },
  { label: "Standard", value: 400 },
  { label: "Long", value: 1000 },
];

const GROWTH_PRESETS = [
  { label: "No growth", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
];

function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  meta,
  required,
  disabled = false,
}) {
  return (
    <label
      className={`choice-card${checked ? " choice-card--selected" : ""}${
        disabled ? " choice-card--disabled" : ""
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        required={required}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="choice-card__indicator" aria-hidden="true" />
      <span className="choice-card__copy">
        <strong>{title}</strong>
        <span>{description}</span>
        {meta ? <small className="choice-card__meta">{meta}</small> : null}
      </span>
    </label>
  );
}

function PresetButtons({ label, presets, value, onChange }) {
  return (
    <div className="preset-group" aria-label={label}>
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          className={`preset-button${value === preset.value ? " preset-button--active" : ""}`}
          onClick={() => onChange(preset.value)}
        >
          {preset.label}
          <small>{preset.value.toLocaleString("en-US")}</small>
        </button>
      ))}
    </div>
  );
}

function ReviewRow({ label, value, step, onEdit }) {
  return (
    <div className="review-row">
      <div>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
      <button type="button" onClick={() => onEdit(step)}>
        Edit<span className="visually-hidden"> {label}</span>
      </button>
    </div>
  );
}

function hasCompletePricing(model) {
  return Number.isFinite(model?.inputPer1K) && Number.isFinite(model?.outputPer1K);
}

function formatModelRate(value, currency) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 6,
  }).format(value);
}

function modelPricingSummary(model, currency) {
  const inputRate = formatModelRate(model.inputPer1K, currency);
  const outputRate = formatModelRate(model.outputPer1K, currency);

  if (!inputRate || !outputRate) {
    return "Complete token pricing is currently unavailable";
  }

  return `${inputRate} input · ${outputRate} output per 1K tokens`;
}

function findFirstIncompleteStep(values, models) {
  if (
    !values.openai.modelId ||
    !models.some(
      (model) => model.id === values.openai.modelId && hasCompletePricing(model),
    )
  ) {
    return 0;
  }
  if (typeof values.rag.enabled !== "boolean") return 1;
  if (values.openai.users < 1 || values.openai.requestsPerDay < 1) return 2;
  if (values.openai.avgPromptTokens < 0 || values.openai.avgCompletionTokens < 0) return 3;
  if (
    values.rag.enabled &&
    (values.rag.avgDocTokens < 0 || values.storage.docStorageGB < 0)
  ) {
    return 3;
  }
  if (typeof values.compute.enabled !== "boolean" || values.global.growthPct < 0) return 4;
  return -1;
}

export function CalculatorForm({
  values,
  setValue,
  currentStep,
  setCurrentStep,
  draftRestored,
  onSubmit,
  onReset,
  status,
  models,
  catalogStatus,
  catalogError,
  catalogCurrency,
  catalogRegion,
  onReloadCatalog,
}) {
  const headingRef = useRef(null);
  const step = STEPS[currentStep];
  const isReviewStep = step.id === "review";
  const selectedModel = models.find(
    (model) => model.id === values.openai.modelId,
  );
  const pricedModels = models.filter(hasCompletePricing);
  const modelStepBlocked =
    step.id === "model" &&
    (catalogStatus !== "success" || pricedModels.length === 0);
  const reviewStepBlocked = isReviewStep && catalogStatus !== "success";

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep]);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!isReviewStep) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const incompleteStep = findFirstIncompleteStep(values, models);
    if (incompleteStep >= 0) {
      setCurrentStep(incompleteStep);
      return;
    }

    onSubmit();
  };

  const handleStartOver = () => {
    if (window.confirm("Clear all saved answers and start again?")) {
      onReset();
    }
  };

  return (
    <form className="calculator-form wizard-card" onSubmit={handleFormSubmit}>
      <div className="wizard-progress" aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
        <div className="wizard-progress__copy">
          <span>
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <strong>{step.label}</strong>
        </div>
        <progress value={currentStep + 1} max={STEPS.length}>
          {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
        </progress>
      </div>

      {draftRestored ? (
        <div className="draft-notice" role="status">
          Your saved answers were restored from this browser.
        </div>
      ) : null}

      <section className="wizard-step" aria-labelledby={`step-heading-${step.id}`}>
        <div className="wizard-step__heading">
          <span className="eyebrow">{step.label}</span>
          <h2 id={`step-heading-${step.id}`} ref={headingRef} tabIndex="-1">
            {step.title}
          </h2>
        </div>

        {step.id === "model" ? (
          <fieldset className="question-fieldset">
            <legend className="visually-hidden">Choose an AI model</legend>
            <p className="question-help">
              Models and token rates come from the backend pricing catalog. Select a
              primary model and we’ll update its cost as you change the remaining
              assumptions. After review, we’ll compare it with the nearest lower- and
              higher-cost catalog models using the same assumptions.
            </p>
            {catalogStatus === "loading" ? (
              <div className="catalog-state" role="status">
                <span className="spinner" aria-hidden="true" />
                Loading available models and current prices…
              </div>
            ) : null}
            {catalogStatus === "error" ? (
              <div className="catalog-state catalog-state--error" role="alert">
                <span>{catalogError}</span>
                <button type="button" className="text-button" onClick={onReloadCatalog}>
                  Try again
                </button>
              </div>
            ) : null}
            {catalogStatus === "success" && models.length === 0 ? (
              <div className="catalog-state catalog-state--error" role="alert">
                No models are available in the pricing cache. Refresh the backend pricing
                data and try again.
              </div>
            ) : null}
            {catalogStatus === "success" && models.length > 0 ? (
              <>
                <div className="catalog-summary">
                  <span>Pricing region</span>
                  <strong>{catalogRegion || "Azure default"}</strong>
                  <span>
                    {pricedModels.length} priced model
                    {pricedModels.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="choice-grid choice-grid--models">
                  {models.map((model) => (
                    <ChoiceCard
                      key={model.id || model.name}
                      name="model"
                      value={model.id}
                      checked={values.openai.modelId === model.id}
                      required
                      disabled={!hasCompletePricing(model)}
                      title={model.name}
                      description="Azure OpenAI model available for this pricing region."
                      meta={modelPricingSummary(model, catalogCurrency)}
                      onChange={() => setValue("openai.modelId", model.id)}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </fieldset>
        ) : null}

        {step.id === "rag" ? (
          <fieldset className="question-fieldset">
            <legend className="visually-hidden">Choose whether to use document search</legend>
            <p className="question-help">{HELP_TEXT.rag.enabled}</p>
            <div className="choice-grid">
              <ChoiceCard
                name="ragEnabled"
                value="yes"
                checked={values.rag.enabled === true}
                required
                title="Yes — search my documents"
                description="Include Azure AI Search, document storage, and retrieved context."
                onChange={() => setValue("rag.enabled", true)}
              />
              <ChoiceCard
                name="ragEnabled"
                value="no"
                checked={values.rag.enabled === false}
                required
                title="No — use the AI model only"
                description="Estimate model usage without a business knowledge base."
                onChange={() => setValue("rag.enabled", false)}
              />
            </div>
          </fieldset>
        ) : null}

        {step.id === "usage" ? (
          <div className="question-panel">
            <p className="question-help">
              We use these answers to calculate the total number of AI interactions in a
              30-day month.
            </p>
            <FormField
              id="expected-users"
              label="How many active people should the estimate include?"
              help={HELP_TEXT.openai.users}
            >
              <NumberInput
                id="expected-users"
                name="users"
                value={values.openai.users}
                min={1}
                required
                unit="people"
                onChange={(value) => setValue("openai.users", value)}
              />
            </FormField>
            <FormField
              id="requests-per-day"
              label="How many AI interactions will each person have per day?"
              help={HELP_TEXT.openai.requestsPerDay}
            >
              <NumberInput
                id="requests-per-day"
                name="requestsPerDay"
                value={values.openai.requestsPerDay}
                min={1}
                required
                unit="interactions"
                onChange={(value) => setValue("openai.requestsPerDay", value)}
              />
            </FormField>
            <div className="calculated-hint">
              About{" "}
              <strong>
                {(values.openai.users * values.openai.requestsPerDay * 30).toLocaleString(
                  "en-US",
                )}
              </strong>{" "}
              AI interactions per month
            </div>
          </div>
        ) : null}

        {step.id === "content" ? (
          <div className="question-panel">
            <p className="question-help">
              Choose a quick preset or enter your own estimate. Tokens are small pieces of
              text used for AI billing.
            </p>
            <div className="preset-section">
              <span>Typical text sent to the AI</span>
              <PresetButtons
                label="Input-size presets"
                presets={PROMPT_PRESETS}
                value={values.openai.avgPromptTokens}
                onChange={(value) => setValue("openai.avgPromptTokens", value)}
              />
            </div>
            <FormField
              id="prompt-tokens"
              label="Average input size"
              help={HELP_TEXT.openai.avgPromptTokens}
            >
              <NumberInput
                id="prompt-tokens"
                name="avgPromptTokens"
                value={values.openai.avgPromptTokens}
                min={0}
                required
                unit="tokens"
                onChange={(value) => setValue("openai.avgPromptTokens", value)}
              />
            </FormField>

            <div className="preset-section">
              <span>Typical AI response length</span>
              <PresetButtons
                label="Response-size presets"
                presets={RESPONSE_PRESETS}
                value={values.openai.avgCompletionTokens}
                onChange={(value) => setValue("openai.avgCompletionTokens", value)}
              />
            </div>
            <FormField
              id="completion-tokens"
              label="Average response size"
              help={HELP_TEXT.openai.avgCompletionTokens}
            >
              <NumberInput
                id="completion-tokens"
                name="avgCompletionTokens"
                value={values.openai.avgCompletionTokens}
                min={0}
                required
                unit="tokens"
                onChange={(value) => setValue("openai.avgCompletionTokens", value)}
              />
            </FormField>

            {values.rag.enabled ? (
              <div className="conditional-panel">
                <div>
                  <span className="eyebrow">Because document search is enabled</span>
                  <h3>Tell us about your business content</h3>
                </div>
                <FormField
                  id="rag-context-tokens"
                  label="Document text added to each interaction"
                  help={HELP_TEXT.rag.avgDocTokens}
                >
                  <NumberInput
                    id="rag-context-tokens"
                    name="avgDocTokens"
                    value={values.rag.avgDocTokens}
                    min={0}
                    required
                    unit="tokens"
                    onChange={(value) => setValue("rag.avgDocTokens", value)}
                  />
                </FormField>
                <FormField
                  id="document-storage"
                  label="Total source documents stored"
                  help={HELP_TEXT.storage.docStorageGB}
                >
                  <NumberInput
                    id="document-storage"
                    name="docStorageGB"
                    value={values.storage.docStorageGB}
                    min={0}
                    step={0.1}
                    required
                    unit="GB"
                    onChange={(value) => setValue("storage.docStorageGB", value)}
                  />
                </FormField>
              </div>
            ) : null}
          </div>
        ) : null}

        {step.id === "planning" ? (
          <div className="question-panel">
            <fieldset className="question-fieldset question-fieldset--nested">
              <legend>Should we include a small web app to host the solution?</legend>
              <p className="question-help">{HELP_TEXT.compute.enabled}</p>
              <div className="choice-grid">
                <ChoiceCard
                  name="computeEnabled"
                  value="yes"
                  checked={values.compute.enabled === true}
                  required
                  title="Yes — include app hosting"
                  description="Add one Azure App Service Basic B1 instance."
                  onChange={() => setValue("compute.enabled", true)}
                />
                <ChoiceCard
                  name="computeEnabled"
                  value="no"
                  checked={values.compute.enabled === false}
                  required
                  title="No — exclude app hosting"
                  description="Estimate only the selected AI and document services."
                  onChange={() => setValue("compute.enabled", false)}
                />
              </div>
            </fieldset>

            <div className="planning-divider" />

            <div className="preset-section">
              <span>How much do you expect usage to grow each month?</span>
              <PresetButtons
                label="Monthly-growth presets"
                presets={GROWTH_PRESETS}
                value={values.global.growthPct}
                onChange={(value) => setValue("global.growthPct", value)}
              />
            </div>
            <FormField
              id="monthly-growth"
              label="Expected monthly growth"
              help={HELP_TEXT.global.growthPct}
            >
              <NumberInput
                id="monthly-growth"
                name="growthPct"
                value={values.global.growthPct}
                min={0}
                step={0.1}
                required
                unit="%"
                onChange={(value) => setValue("global.growthPct", value)}
              />
            </FormField>
          </div>
        ) : null}

        {step.id === "review" ? (
          <div className="review-panel">
            <p className="question-help">
              Check your answers before requesting final prices. The browser selects
              nearby lower- and higher-cost models from the catalog, and the backend
              calculates every option using these same assumptions.
            </p>
            <dl className="review-list">
              <ReviewRow
                label="AI model"
                value={selectedModel?.name || "Not selected"}
                step={0}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Business document search"
                value={values.rag.enabled ? "Included" : "Not included"}
                step={1}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Active people"
                value={values.openai.users.toLocaleString("en-US")}
                step={2}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Daily interactions"
                value={`${values.openai.requestsPerDay.toLocaleString("en-US")} per person`}
                step={2}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Average input"
                value={`${values.openai.avgPromptTokens.toLocaleString("en-US")} tokens`}
                step={3}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Average response"
                value={`${values.openai.avgCompletionTokens.toLocaleString("en-US")} tokens`}
                step={3}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="RAG document context"
                value={
                  values.rag.enabled
                    ? `${values.rag.avgDocTokens.toLocaleString("en-US")} tokens per interaction`
                    : "Not used"
                }
                step={3}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="RAG document storage"
                value={
                  values.rag.enabled
                    ? `${values.storage.docStorageGB.toLocaleString("en-US")} GB`
                    : "Not used"
                }
                step={3}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="App hosting"
                value={values.compute.enabled ? "Basic B1 included" : "Not included"}
                step={4}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="Expected growth"
                value={`${values.global.growthPct.toLocaleString("en-US")}% per month`}
                step={4}
                onEdit={setCurrentStep}
              />
            </dl>
          </div>
        ) : null}
      </section>

      <div className="wizard-save-status" role="status">
        Answers are saved automatically in this browser.
      </div>

      <div className="wizard-actions">
        <div>
          {currentStep > 0 ? (
            <button
              type="button"
              className="secondary-button"
              disabled={status === "loading"}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </button>
          ) : null}
          {isReviewStep ? (
            <button
              type="button"
              className="text-button"
              disabled={status === "loading"}
              onClick={handleStartOver}
            >
              Start over
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className="primary-button primary-button--compact"
          disabled={status === "loading" || modelStepBlocked || reviewStepBlocked}
        >
          {status === "loading"
            ? "Comparing…"
            : isReviewStep
              ? "Compare option costs"
              : "Continue"}
        </button>
      </div>
    </form>
  );
}
