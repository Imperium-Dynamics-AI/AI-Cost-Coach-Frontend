import { getScenarios } from "../config/calculatorConfig.js";

export function buildEstimatePayload(values) {
  return {
    resources: { ...values.resources },
    scenarios: getScenarios(values.openai.model).map(({ id, model, forceRag }) => ({
      id,
      model,
      forceRag,
    })),
    openai: {
      model: values.openai.model,
      billingMode: values.openai.billingMode,
      regionType: values.openai.regionType,
      users: values.openai.users,
      requestsPerDay: values.openai.requestsPerDay,
      avgPromptTokens: values.openai.avgPromptTokens,
      avgCompletionTokens: values.openai.avgCompletionTokens,
      historyTurns: values.openai.historyTurns,
      systemOverheadTokens: values.openai.systemOverheadTokens,
      maxTokensCap: values.openai.maxTokensCap,
      ptu: {
        count: values.openai.ptuCount,
        commitment: values.openai.ptuCommitment,
        scope: values.openai.ptuScope,
      },
      batch: { percentEligible: values.openai.batchPct },
    },
    rag: {
      embeddingModel: values.rag.embeddingModel,
      numDocuments: values.rag.numDocuments,
      avgDocTokens: values.rag.avgDocTokens,
      chunkSize: values.rag.chunkSize,
      reindexFreq: values.rag.reindexFreq,
      vectorQueriesPerDay: values.rag.vectorQueriesPerDay,
      searchTier: values.rag.searchTier,
      replicaCount: values.rag.replicaCount,
    },
    storage: { ...values.storage },
    compute: {
      appServiceTier: values.compute.appServiceTier,
      functionsPlan: values.compute.functionsPlan,
      environments: { ...values.compute.environments },
    },
    apim: { ...values.apim },
    monitoring: { ...values.monitoring },
    identity: { ...values.identity },
    finetuning: { ...values.finetuning },
    global: { ...values.global },
  };
}
