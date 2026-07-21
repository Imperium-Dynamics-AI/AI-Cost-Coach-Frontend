# Cost estimate API contract

This is the hand-off contract for the future backend. The frontend endpoint is configured by `VITE_API_BASE_URL` and defaults to the same origin.

## Endpoint

`POST /api/v1/cost-estimates`

Request headers:

```http
Content-Type: application/json
```

## Request

The request contains the selected resources, the three comparison scenarios, and the assumptions collected in the form.

```json
{
  "resources": {
    "openai": true,
    "rag": true,
    "storage": false,
    "compute": false,
    "apim": false,
    "monitoring": false,
    "identity": false,
    "finetuning": false
  },
  "scenarios": [
    { "id": "A", "model": "GPT-4o", "forceRag": false },
    { "id": "B", "model": "GPT-4.1", "forceRag": false },
    { "id": "C", "model": "GPT-4o", "forceRag": true }
  ],
  "openai": {
    "model": "GPT-4o",
    "billingMode": "payg",
    "regionType": "global",
    "users": 500,
    "requestsPerDay": 5,
    "avgPromptTokens": 800,
    "avgCompletionTokens": 400,
    "historyTurns": 1,
    "systemOverheadTokens": 300,
    "maxTokensCap": 0,
    "ptu": { "count": 15, "commitment": "annual", "scope": "global" },
    "batch": { "percentEligible": 30 }
  },
  "rag": {
    "embeddingModel": "small",
    "numDocuments": 2000,
    "avgDocTokens": 600,
    "chunkSize": 300,
    "reindexFreq": "onetime",
    "vectorQueriesPerDay": 200,
    "searchTier": "basic",
    "replicaCount": 1
  },
  "storage": {
    "docStorageGB": 5,
    "storageGrowthPct": 5,
    "vectorStorageGB": 2,
    "sqlTier": "standard"
  },
  "compute": {
    "appServiceTier": "basic",
    "functionsPlan": "consumption",
    "environments": { "dev": true, "test": false, "prod": true }
  },
  "apim": { "apimTier": "developer" },
  "monitoring": { "logGB": 10, "retentionDays": 30 },
  "identity": {
    "entraTier": "free",
    "licensedUsers": 500,
    "keyVaultIncluded": true
  },
  "finetuning": { "hostingOn": false, "trainingCost": 0 },
  "global": { "retryOverheadPct": 10, "growthPct": 10, "infraOverheadUsd": 40 }
}
```

## Successful response

All monetary values are numbers in the declared currency. A resource cost may be `null` only when the backend cannot price it; the backend should include a warning in that case.

```json
{
  "currency": "USD",
  "totalMonthlyRequests": 75000,
  "cheapestId": "A",
  "warnings": [],
  "scenarios": {
    "A": {
      "name": "GPT-4o",
      "breakdown": {
        "openai": 120.5,
        "rag": 0,
        "storage": 0,
        "compute": 0,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 120.5,
      "annualTotal": 1446,
      "costPerUser": 0.241,
      "costPerConversation": 0.0016,
      "nextMonthProjected": 132.55
    }
  }
}
```

The response must contain entries for scenario IDs `A`, `B`, and `C`, even when one cannot be priced.

## Error response

Use an appropriate HTTP status and a stable error shape:

```json
{
  "code": "INVALID_ESTIMATE_INPUT",
  "message": "One or more assumptions are invalid.",
  "fieldErrors": {
    "openai.users": "Must be zero or greater."
  }
}
```
