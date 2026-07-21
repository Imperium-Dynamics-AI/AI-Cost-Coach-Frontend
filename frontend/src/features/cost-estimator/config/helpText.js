export const HELP_TEXT = {
  openai: {
    model:
      "Choose the AI model you expect the main solution to use. Model input and output rates can differ substantially. This choice drives Option A in the comparison.",
    billingMode:
      "Pay-as-you-go is usually best for a new or changing workload. Reserved capacity is intended for steady, high-volume use. Flexible batch work can run later and may cost less.",
    ptuCount:
      "Provisioned Throughput Units (PTUs) are dedicated AI processing capacity. More units support more traffic but add a fixed cost even when they are not fully used.",
    ptuCommitment:
      "A longer reservation can reduce the effective price, but you commit to paying for the capacity for that period.",
    ptuScope:
      "Global capacity can route within Microsoft’s global infrastructure. Regional capacity keeps processing in one chosen Azure region and can have different pricing or availability.",
    batchPct:
      "The share of requests that do not need an immediate answer and can be processed asynchronously. Only include work that can tolerate a delayed result.",
    regionType:
      "Controls where Azure may process requests. Global options usually offer the widest model availability; stricter data-location choices can affect price and availability.",
    users:
      "The number of people expected to use the solution in a typical month. More users usually means more AI requests.",
    requestsPerDay:
      "How many questions or AI-powered actions one person performs on an average active day. Each action is one model request.",
    avgPromptTokens:
      "The typical size of the user message and any content sent with it. Tokens are small pieces of text used for billing; 1,000 tokens is roughly 750 English words, though this varies.",
    avgCompletionTokens:
      "The typical size of the AI answer. Longer answers process more output tokens and usually cost more.",
    historyTurns:
      "How many earlier question-and-answer pairs are sent again so the AI remembers the conversation. More history increases the text processed on every request.",
    systemOverheadTokens:
      "Extra text the app sends behind the scenes, such as instructions, safety rules, tool definitions, or document context. Users do not type this text, but the model still processes it.",
    maxTokensCap:
      "An optional hard limit on the length of each AI answer. Enter 0 for no separate cap. A cap can prevent unexpectedly long and costly responses.",
  },
  rag: {
    embeddingModel:
      "This model prepares documents for meaning-based search; it does not write the final answer. The higher-quality option can improve matching but costs more to index content.",
    numDocuments:
      "The number of files or records in the searchable knowledge base. More documents require more indexing work and storage.",
    avgDocTokens:
      "The average amount of text in each document. Use a representative sample if file sizes vary widely.",
    chunkSize:
      "Documents are split into smaller passages for search. Smaller passages can improve precision but create more items to index; larger passages send more context to the AI.",
    reindexFreq:
      "Choose a recurring refresh when documents change regularly. Reprocessing changed content creates additional embedding usage.",
    vectorQueriesPerDay:
      "How often the app searches the knowledge base each day. One AI interaction may perform one or several searches.",
    searchTier:
      "The Azure AI Search service size. Larger plans provide more storage and performance, but have a higher fixed monthly cost.",
    replicaCount:
      "A planning estimate for extra search capacity. Additional replicas or partitions improve availability, throughput, or storage and increase the fixed search cost.",
  },
  storage: {
    docStorageGB:
      "Space used by original source files such as PDFs, images, and Office documents. This is separate from the searchable index.",
    storageGrowthPct:
      "The expected percentage increase in stored files each month. It is used to project the next month rather than only today’s storage.",
    vectorStorageGB:
      "Estimated space for the meaning-based search index created from your documents. Larger document collections and smaller passages create a larger index.",
    sqlTier:
      "The size of the relational database used for application records such as settings, feedback, or audit data. Choose based on the app workload, not AI model usage.",
  },
  compute: {
    appServiceTier:
      "The hosting size for the website or API around the AI solution. The AI model runs on a separate Azure service and is not included in this plan.",
    functionsPlan:
      "Background tasks can be billed only when they run, or kept warm for faster and more predictable performance at a fixed cost.",
    environments:
      "Include each separate copy of the solution your team will operate. Development, testing, and production environments can each need their own hosting, database, and supporting services.",
  },
  apim: {
    apimTier:
      "Azure API Management protects and governs APIs with authentication, policies, quotas, and analytics. The Developer plan is not intended for production availability.",
  },
  monitoring: {
    logGB:
      "The amount of diagnostic and usage data collected each month. More detailed logging makes troubleshooting easier but increases ingestion cost.",
    retentionDays:
      "How long logs remain available for investigation and reporting. Longer retention can add storage cost after the included period.",
  },
  identity: {
    entraTier:
      "Microsoft Entra ID provides user sign-in and access control. Paid plans add capabilities such as conditional access and identity risk protection.",
    licensedUsers:
      "The number of people who need the selected paid identity features. Free users do not need a paid license entered here.",
    keyVaultIncluded:
      "Azure Key Vault securely stores API keys, passwords, and certificates. Its direct cost is usually small, but including it avoids leaving a real supporting service out of the estimate.",
  },
  finetuning: {
    hostingOn:
      "Some custom models have a fixed hosting charge while deployed, even when no one is using them. Turn this on only when a trained model must stay ready for requests.",
    trainingCost:
      "A one-time budget allowance for running the training job. It is kept separate from the recurring monthly estimate.",
  },
  global: {
    retryOverheadPct:
      "Adds a safety allowance for requests repeated because of temporary errors, rate limits, or timeouts. A small buffer prevents an unrealistically exact estimate.",
    growthPct:
      "How much you expect overall usage to increase next month. This drives the next-month projection shown in the results.",
    infraOverheadUsd:
      "A fixed monthly allowance for small supporting services not listed separately, such as secrets, networking, or configuration storage.",
  },
};
