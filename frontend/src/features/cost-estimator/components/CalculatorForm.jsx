import { useEffect, useRef } from "react";
import { FormField } from "../../../shared/components/FormField";
import { NumberInput } from "../../../shared/components/NumberInput";
import { MODEL_OPTIONS } from "../config/calculatorConfig";
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

function ChoiceCard({ name, value, checked, onChange, title, description, required }) {
  return (
    <label className={`choice-card${checked ? " choice-card--selected" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        required={required}
        onChange={onChange}
      />
      <span className="choice-card__indicator" aria-hidden="true" />
      <span className="choice-card__copy">
        <strong>{title}</strong>
        <span>{description}</span>
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

function findFirstIncompleteStep(values) {
  if (!values.openai.model) return 0;
  if (typeof values.rag.enabled !== "boolean") return 1;
  if (values.openai.users < 1 || values.openai.requestsPerDay < 1) return 2;
  if (values.openai.avgPromptTokens < 0 || values.openai.avgCompletionTokens < 0) return 3;
  if (values.rag.avgDocTokens < 0 || values.storage.docStorageGB < 0) {
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
}) {
  const headingRef = useRef(null);
  const step = STEPS[currentStep];
  const isReviewStep = step.id === "review";
  const comparisonModel = MODEL_OPTIONS.find(
    (model) => model.value !== values.openai.model,
  )?.label;

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep]);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!isReviewStep) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const incompleteStep = findFirstIncompleteStep(values);
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
              Select the model that best matches the work your solution will perform. This
              will be your primary choice, and we’ll compare it with the other model using
              the same assumptions.
            </p>
            <div className="choice-grid">
              {MODEL_OPTIONS.map((model) => (
                <ChoiceCard
                  key={model.value}
                  name="model"
                  value={model.value}
                  checked={values.openai.model === model.value}
                  required
                  title={model.label}
                  description={model.description}
                  onChange={() => setValue("openai.model", model.value)}
                />
              ))}
            </div>
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

            <div className="conditional-panel">
              <div>
                <span className="eyebrow">
                  {values.rag.enabled
                    ? "Because document search is enabled"
                    : "For the option with document search"}
                </span>
                <h3>
                  {values.rag.enabled
                    ? "Tell us about your business content"
                    : "Set the RAG comparison assumptions"}
                </h3>
                {!values.rag.enabled ? (
                  <p className="question-help">
                    These values are used only for Option C, which shows your selected
                    model with RAG.
                  </p>
                ) : null}
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
              Check your answers before sending them to the pricing service. The options
              share the same usage assumptions, and Option C shows your selected model
              with the opposite RAG setting.
            </p>
            <dl className="review-list">
              <ReviewRow label="AI model" value={values.openai.model || "Not selected"} step={0} onEdit={setCurrentStep} />
              <ReviewRow
                label="Compared with"
                value={comparisonModel || "Not available"}
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
                label="Option C RAG comparison"
                value={values.rag.enabled ? "Without RAG" : "With RAG"}
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
                value={`${values.rag.avgDocTokens.toLocaleString("en-US")} tokens per interaction`}
                step={3}
                onEdit={setCurrentStep}
              />
              <ReviewRow
                label="RAG document storage"
                value={`${values.storage.docStorageGB.toLocaleString("en-US")} GB`}
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
          disabled={status === "loading"}
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
