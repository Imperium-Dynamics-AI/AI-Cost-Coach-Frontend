import { useState } from "react";
import { Accordion } from "../../../shared/components/Accordion";
import { Checkbox } from "../../../shared/components/Checkbox";
import { FormField } from "../../../shared/components/FormField";
import { NumberInput } from "../../../shared/components/NumberInput";
import { SelectInput } from "../../../shared/components/SelectInput";
import {
  SECTION_COPY,
  SELECT_OPTIONS,
} from "../config/calculatorConfig";
import { HELP_TEXT } from "../config/helpText";
import { ResourceSelector } from "./ResourceSelector";

export function CalculatorForm({
  values,
  setValue,
  toggleResource,
  hasSelectedResource,
  onSubmit,
  status,
}) {
  const [openSection, setOpenSection] = useState("openai");

  const toggleSection = (section) => {
    setOpenSection((current) => (current === section ? "" : section));
  };

  return (
    <form className="calculator-form" onSubmit={onSubmit}>
      <ResourceSelector
        selected={values.resources}
        onToggle={toggleResource}
        showError={!hasSelectedResource}
      />

      {values.resources.openai ? (
        <Accordion
          {...SECTION_COPY.openai}
          open={openSection === "openai"}
          onToggle={() => toggleSection("openai")}
        >
          <FormField
            id="ai-model"
            label="AI model"
            help={HELP_TEXT.openai.model}
          >
            <SelectInput
              id="ai-model"
              name="model"
              value={values.openai.model}
              options={SELECT_OPTIONS.models}
              onChange={(value) => setValue("openai.model", value)}
            />
          </FormField>
          <FormField
            id="billing-mode"
            label="How should AI usage be billed?"
            help={HELP_TEXT.openai.billingMode}
          >
            <SelectInput
              id="billing-mode"
              name="billingMode"
              value={values.openai.billingMode}
              options={SELECT_OPTIONS.billingModes}
              onChange={(value) => setValue("openai.billingMode", value)}
            />
          </FormField>

          {values.openai.billingMode === "ptu" ? (
            <>
              <FormField
                id="ptu-count"
                label="Reserved capacity units (PTUs)"
                help={HELP_TEXT.openai.ptuCount}
              >
                <NumberInput
                  id="ptu-count"
                  name="ptuCount"
                  value={values.openai.ptuCount}
                  min={15}
                  unit="PTUs"
                  onChange={(value) => setValue("openai.ptuCount", value)}
                />
              </FormField>
              <FormField
                id="ptu-commitment"
                label="Reservation period"
                help={HELP_TEXT.openai.ptuCommitment}
              >
                <SelectInput
                  id="ptu-commitment"
                  name="ptuCommitment"
                  value={values.openai.ptuCommitment}
                  options={SELECT_OPTIONS.ptuCommitments}
                  onChange={(value) => setValue("openai.ptuCommitment", value)}
                />
              </FormField>
              <FormField
                id="ptu-scope"
                label="Where can reserved capacity run?"
                help={HELP_TEXT.openai.ptuScope}
              >
                <SelectInput
                  id="ptu-scope"
                  name="ptuScope"
                  value={values.openai.ptuScope}
                  options={SELECT_OPTIONS.ptuScopes}
                  onChange={(value) => setValue("openai.ptuScope", value)}
                />
              </FormField>
            </>
          ) : null}

          {values.openai.billingMode === "batch" ? (
            <FormField
              id="batch-percent"
              label="Work that can wait for a result"
              help={HELP_TEXT.openai.batchPct}
            >
              <NumberInput
                id="batch-percent"
                name="batchPercent"
                value={values.openai.batchPct}
                min={0}
                max={100}
                unit="%"
                onChange={(value) => setValue("openai.batchPct", value)}
              />
            </FormField>
          ) : null}

          <FormField
            id="region-type"
            label="Data hosting option"
            help={HELP_TEXT.openai.regionType}
          >
            <SelectInput
              id="region-type"
              name="regionType"
              value={values.openai.regionType}
              options={SELECT_OPTIONS.regionTypes}
              onChange={(value) => setValue("openai.regionType", value)}
            />
          </FormField>
          <FormField
            id="expected-users"
            label="People using the solution"
            help={HELP_TEXT.openai.users}
          >
            <NumberInput
              id="expected-users"
              name="users"
              value={values.openai.users}
              min={0}
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
              min={0}
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
          <FormField
            id="history-turns"
            label="Earlier conversation turns included"
            help={HELP_TEXT.openai.historyTurns}
          >
            <NumberInput
              id="history-turns"
              name="historyTurns"
              value={values.openai.historyTurns}
              min={0}
              unit="turns"
              onChange={(value) => setValue("openai.historyTurns", value)}
            />
          </FormField>
          <FormField
            id="overhead-tokens"
            label="Hidden instruction and tool text"
            help={HELP_TEXT.openai.systemOverheadTokens}
          >
            <NumberInput
              id="overhead-tokens"
              name="systemOverheadTokens"
              value={values.openai.systemOverheadTokens}
              min={0}
              unit="tokens"
              onChange={(value) => setValue("openai.systemOverheadTokens", value)}
            />
          </FormField>
          <FormField
            id="max-token-cap"
            label="Maximum AI answer length"
            help={HELP_TEXT.openai.maxTokensCap}
          >
            <NumberInput
              id="max-token-cap"
              name="maxTokensCap"
              value={values.openai.maxTokensCap}
              min={0}
              unit="tokens"
              onChange={(value) => setValue("openai.maxTokensCap", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.rag ? (
        <Accordion
          {...SECTION_COPY.rag}
          open={openSection === "rag"}
          onToggle={() => toggleSection("rag")}
        >
          <FormField
            id="embedding-model"
            label="Search indexing quality"
            help={HELP_TEXT.rag.embeddingModel}
          >
            <SelectInput
              id="embedding-model"
              name="embeddingModel"
              value={values.rag.embeddingModel}
              options={SELECT_OPTIONS.embeddingModels}
              onChange={(value) => setValue("rag.embeddingModel", value)}
            />
          </FormField>
          <FormField
            id="document-count"
            label="Documents to make searchable"
            help={HELP_TEXT.rag.numDocuments}
          >
            <NumberInput
              id="document-count"
              name="numDocuments"
              value={values.rag.numDocuments}
              min={0}
              unit="documents"
              onChange={(value) => setValue("rag.numDocuments", value)}
            />
          </FormField>
          <FormField
            id="document-size"
            label="Typical document size"
            help={HELP_TEXT.rag.avgDocTokens}
          >
            <NumberInput
              id="document-size"
              name="avgDocTokens"
              value={values.rag.avgDocTokens}
              min={0}
              unit="tokens"
              onChange={(value) => setValue("rag.avgDocTokens", value)}
            />
          </FormField>
          <FormField
            id="chunk-size"
            label="Search passage size"
            help={HELP_TEXT.rag.chunkSize}
          >
            <NumberInput
              id="chunk-size"
              name="chunkSize"
              value={values.rag.chunkSize}
              min={50}
              unit="tokens"
              onChange={(value) => setValue("rag.chunkSize", value)}
            />
          </FormField>
          <FormField
            id="reindex-frequency"
            label="How often content is refreshed"
            help={HELP_TEXT.rag.reindexFreq}
          >
            <SelectInput
              id="reindex-frequency"
              name="reindexFreq"
              value={values.rag.reindexFreq}
              options={SELECT_OPTIONS.reindexFrequencies}
              onChange={(value) => setValue("rag.reindexFreq", value)}
            />
          </FormField>
          <FormField
            id="searches-per-day"
            label="Knowledge-base searches each day"
            help={HELP_TEXT.rag.vectorQueriesPerDay}
          >
            <NumberInput
              id="searches-per-day"
              name="vectorQueriesPerDay"
              value={values.rag.vectorQueriesPerDay}
              min={0}
              unit="searches"
              onChange={(value) => setValue("rag.vectorQueriesPerDay", value)}
            />
          </FormField>
          <FormField
            id="search-tier"
            label="Search service size"
            help={HELP_TEXT.rag.searchTier}
          >
            <SelectInput
              id="search-tier"
              name="searchTier"
              value={values.rag.searchTier}
              options={SELECT_OPTIONS.searchTiers}
              onChange={(value) => setValue("rag.searchTier", value)}
            />
          </FormField>
          <FormField
            id="search-capacity"
            label="Additional search capacity units"
            help={HELP_TEXT.rag.replicaCount}
          >
            <NumberInput
              id="search-capacity"
              name="replicaCount"
              value={values.rag.replicaCount}
              min={1}
              unit="units"
              onChange={(value) => setValue("rag.replicaCount", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.storage ? (
        <Accordion
          {...SECTION_COPY.storage}
          open={openSection === "storage"}
          onToggle={() => toggleSection("storage")}
        >
          <FormField
            id="document-storage"
            label="Source files stored"
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
          <FormField
            id="storage-growth"
            label="Expected file growth each month"
            help={HELP_TEXT.storage.storageGrowthPct}
          >
            <NumberInput
              id="storage-growth"
              name="storageGrowthPct"
              value={values.storage.storageGrowthPct}
              min={0}
              unit="%"
              onChange={(value) => setValue("storage.storageGrowthPct", value)}
            />
          </FormField>
          <FormField
            id="vector-storage"
            label="Searchable knowledge-base size"
            help={HELP_TEXT.storage.vectorStorageGB}
          >
            <NumberInput
              id="vector-storage"
              name="vectorStorageGB"
              value={values.storage.vectorStorageGB}
              min={0}
              unit="GB"
              onChange={(value) => setValue("storage.vectorStorageGB", value)}
            />
          </FormField>
          <FormField
            id="sql-tier"
            label="Application database size"
            help={HELP_TEXT.storage.sqlTier}
          >
            <SelectInput
              id="sql-tier"
              name="sqlTier"
              value={values.storage.sqlTier}
              options={SELECT_OPTIONS.sqlTiers}
              onChange={(value) => setValue("storage.sqlTier", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.compute ? (
        <Accordion
          {...SECTION_COPY.compute}
          open={openSection === "compute"}
          onToggle={() => toggleSection("compute")}
        >
          <FormField
            id="app-service-tier"
            label="Web app and API hosting"
            help={HELP_TEXT.compute.appServiceTier}
          >
            <SelectInput
              id="app-service-tier"
              name="appServiceTier"
              value={values.compute.appServiceTier}
              options={SELECT_OPTIONS.appServiceTiers}
              onChange={(value) => setValue("compute.appServiceTier", value)}
            />
          </FormField>
          <FormField
            id="functions-plan"
            label="Background task hosting"
            help={HELP_TEXT.compute.functionsPlan}
          >
            <SelectInput
              id="functions-plan"
              name="functionsPlan"
              value={values.compute.functionsPlan}
              options={SELECT_OPTIONS.functionsPlans}
              onChange={(value) => setValue("compute.functionsPlan", value)}
            />
          </FormField>
          <FormField
            id="environment-dev"
            label="Separate environments to include"
            help={HELP_TEXT.compute.environments}
            stacked
          >
            <div className="checkbox-group">
              <Checkbox
                id="environment-dev"
                name="environmentDev"
                label="Development"
                checked={values.compute.environments.dev}
                onChange={(value) => setValue("compute.environments.dev", value)}
              />
              <Checkbox
                id="environment-test"
                name="environmentTest"
                label="Testing"
                checked={values.compute.environments.test}
                onChange={(value) => setValue("compute.environments.test", value)}
              />
              <Checkbox
                id="environment-prod"
                name="environmentProd"
                label="Production"
                checked={values.compute.environments.prod}
                onChange={(value) => setValue("compute.environments.prod", value)}
              />
            </div>
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.apim ? (
        <Accordion
          {...SECTION_COPY.apim}
          open={openSection === "apim"}
          onToggle={() => toggleSection("apim")}
        >
          <FormField
            id="apim-tier"
            label="API protection plan"
            help={HELP_TEXT.apim.apimTier}
          >
            <SelectInput
              id="apim-tier"
              name="apimTier"
              value={values.apim.apimTier}
              options={SELECT_OPTIONS.apimTiers}
              onChange={(value) => setValue("apim.apimTier", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.monitoring ? (
        <Accordion
          {...SECTION_COPY.monitoring}
          open={openSection === "monitoring"}
          onToggle={() => toggleSection("monitoring")}
        >
          <FormField
            id="log-volume"
            label="Monitoring data collected each month"
            help={HELP_TEXT.monitoring.logGB}
          >
            <NumberInput
              id="log-volume"
              name="logGB"
              value={values.monitoring.logGB}
              min={0}
              unit="GB"
              onChange={(value) => setValue("monitoring.logGB", value)}
            />
          </FormField>
          <FormField
            id="retention-days"
            label="How long logs are kept"
            help={HELP_TEXT.monitoring.retentionDays}
          >
            <NumberInput
              id="retention-days"
              name="retentionDays"
              value={values.monitoring.retentionDays}
              min={0}
              unit="days"
              onChange={(value) => setValue("monitoring.retentionDays", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.identity ? (
        <Accordion
          {...SECTION_COPY.identity}
          open={openSection === "identity"}
          onToggle={() => toggleSection("identity")}
        >
          <FormField
            id="identity-tier"
            label="Sign-in and access plan"
            help={HELP_TEXT.identity.entraTier}
          >
            <SelectInput
              id="identity-tier"
              name="entraTier"
              value={values.identity.entraTier}
              options={SELECT_OPTIONS.entraTiers}
              onChange={(value) => setValue("identity.entraTier", value)}
            />
          </FormField>
          <FormField
            id="licensed-users"
            label="People needing paid sign-in features"
            help={HELP_TEXT.identity.licensedUsers}
          >
            <NumberInput
              id="licensed-users"
              name="licensedUsers"
              value={values.identity.licensedUsers}
              min={0}
              unit="people"
              onChange={(value) => setValue("identity.licensedUsers", value)}
            />
          </FormField>
          <FormField
            id="key-vault"
            label="Secure storage for keys and passwords"
            help={HELP_TEXT.identity.keyVaultIncluded}
          >
            <SelectInput
              id="key-vault"
              name="keyVaultIncluded"
              value={values.identity.keyVaultIncluded ? "included" : "excluded"}
              options={SELECT_OPTIONS.keyVaultOptions}
              onChange={(value) =>
                setValue("identity.keyVaultIncluded", value === "included")
              }
            />
          </FormField>
        </Accordion>
      ) : null}

      {values.resources.finetuning ? (
        <Accordion
          {...SECTION_COPY.finetuning}
          open={openSection === "finetuning"}
          onToggle={() => toggleSection("finetuning")}
        >
          <FormField
            id="custom-model-hosting"
            label="Custom model availability"
            help={HELP_TEXT.finetuning.hostingOn}
          >
            <SelectInput
              id="custom-model-hosting"
              name="hostingOn"
              value={values.finetuning.hostingOn ? "on" : "off"}
              options={SELECT_OPTIONS.hostingOptions}
              onChange={(value) => setValue("finetuning.hostingOn", value === "on")}
            />
          </FormField>
          <FormField
            id="training-cost"
            label="One-time training budget"
            help={HELP_TEXT.finetuning.trainingCost}
          >
            <NumberInput
              id="training-cost"
              name="trainingCost"
              value={values.finetuning.trainingCost}
              min={0}
              prefix="$"
              unit="USD"
              onChange={(value) => setValue("finetuning.trainingCost", value)}
            />
          </FormField>
        </Accordion>
      ) : null}

      <Accordion
        {...SECTION_COPY.global}
        open={openSection === "global"}
        onToggle={() => toggleSection("global")}
      >
        <FormField
          id="retry-overhead"
          label="Extra usage for retries and busy periods"
          help={HELP_TEXT.global.retryOverheadPct}
        >
          <NumberInput
            id="retry-overhead"
            name="retryOverheadPct"
            value={values.global.retryOverheadPct}
            min={0}
            unit="%"
            onChange={(value) => setValue("global.retryOverheadPct", value)}
          />
        </FormField>
        <FormField
          id="next-month-growth"
          label="Expected usage growth next month"
          help={HELP_TEXT.global.growthPct}
        >
          <NumberInput
            id="next-month-growth"
            name="growthPct"
            value={values.global.growthPct}
            min={0}
            unit="%"
            onChange={(value) => setValue("global.growthPct", value)}
          />
        </FormField>
        <FormField
          id="infrastructure-overhead"
          label="Other fixed Azure costs each month"
          help={HELP_TEXT.global.infraOverheadUsd}
        >
          <NumberInput
            id="infrastructure-overhead"
            name="infraOverheadUsd"
            value={values.global.infraOverheadUsd}
            min={0}
            prefix="$"
            unit="USD"
            onChange={(value) => setValue("global.infraOverheadUsd", value)}
          />
        </FormField>
      </Accordion>

      <button
        type="submit"
        className="primary-button"
        disabled={!hasSelectedResource || status === "loading"}
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
