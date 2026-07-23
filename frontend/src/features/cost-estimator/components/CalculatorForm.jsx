import { useState } from "react";
import { Accordion } from "../../../shared/components/Accordion";
import { Checkbox } from "../../../shared/components/Checkbox";
import { FormField } from "../../../shared/components/FormField";
import { NumberInput } from "../../../shared/components/NumberInput";
import { SECTION_COPY } from "../config/calculatorConfig";
import { HELP_TEXT } from "../config/helpText";

export function CalculatorForm({ values, setValue, onSubmit, status }) {
  const [openSection, setOpenSection] = useState("openai");

  const toggleSection = (section) => {
    setOpenSection((current) => (current === section ? "" : section));
  };

  return (
    <form className="calculator-form" onSubmit={onSubmit}>
      <Accordion
        {...SECTION_COPY.openai}
        open={openSection === "openai"}
        onToggle={() => toggleSection("openai")}
      >
        <FormField
          id="expected-users"
          label="Active people using the solution"
          help={HELP_TEXT.openai.users}
        >
          <NumberInput
            id="expected-users"
            name="users"
            value={values.openai.users}
            min={1}
            unit="people"
            onChange={(value) => setValue("openai.users", value)}
          />
        </FormField>
        <FormField
          id="requests-per-day"
          label="AI interactions per person each day"
          help={HELP_TEXT.openai.requestsPerDay}
        >
          <NumberInput
            id="requests-per-day"
            name="requestsPerDay"
            value={values.openai.requestsPerDay}
            min={1}
            unit="requests"
            onChange={(value) => setValue("openai.requestsPerDay", value)}
          />
        </FormField>
        <FormField
          id="prompt-tokens"
          label="Typical user message size"
          help={HELP_TEXT.openai.avgPromptTokens}
        >
          <NumberInput
            id="prompt-tokens"
            name="avgPromptTokens"
            value={values.openai.avgPromptTokens}
            min={0}
            unit="tokens"
            onChange={(value) => setValue("openai.avgPromptTokens", value)}
          />
        </FormField>
        <FormField
          id="completion-tokens"
          label="Typical AI answer size"
          help={HELP_TEXT.openai.avgCompletionTokens}
        >
          <NumberInput
            id="completion-tokens"
            name="avgCompletionTokens"
            value={values.openai.avgCompletionTokens}
            min={0}
            unit="tokens"
            onChange={(value) => setValue("openai.avgCompletionTokens", value)}
          />
        </FormField>
      </Accordion>

      <Accordion
        {...SECTION_COPY.rag}
        open={openSection === "rag"}
        onToggle={() => toggleSection("rag")}
      >
        <FormField
          id="rag-context-tokens"
          label="Document text added to each AI request"
          help={HELP_TEXT.rag.avgDocTokens}
        >
          <NumberInput
            id="rag-context-tokens"
            name="avgDocTokens"
            value={values.rag.avgDocTokens}
            min={0}
            unit="tokens"
            onChange={(value) => setValue("rag.avgDocTokens", value)}
          />
        </FormField>
        <FormField
          id="document-storage"
          label="Source documents stored"
          help={HELP_TEXT.storage.docStorageGB}
        >
          <NumberInput
            id="document-storage"
            name="docStorageGB"
            value={values.storage.docStorageGB}
            min={0}
            unit="GB"
            onChange={(value) => setValue("storage.docStorageGB", value)}
          />
        </FormField>
      </Accordion>

      <Accordion
        {...SECTION_COPY.compute}
        open={openSection === "compute"}
        onToggle={() => toggleSection("compute")}
      >
        <FormField
          id="include-app-hosting"
          label="App Service hosting"
          help={HELP_TEXT.compute.enabled}
          stacked
        >
          <Checkbox
            id="include-app-hosting"
            name="includeAppHosting"
            label="Include one Basic B1 App Service instance"
            checked={values.compute.enabled}
            onChange={(value) => setValue("compute.enabled", value)}
          />
        </FormField>
      </Accordion>

      <Accordion
        {...SECTION_COPY.global}
        open={openSection === "global"}
        onToggle={() => toggleSection("global")}
      >
        <FormField
          id="monthly-growth"
          label="Expected usage growth each month"
          help={HELP_TEXT.global.growthPct}
        >
          <NumberInput
            id="monthly-growth"
            name="growthPct"
            value={values.global.growthPct}
            min={0}
            unit="%"
            onChange={(value) => setValue("global.growthPct", value)}
          />
        </FormField>
      </Accordion>

      <button
        type="submit"
        className="primary-button"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Preparing estimate…
          </>
        ) : (
          "Estimate and compare monthly cost"
        )}
      </button>
    </form>
  );
}
