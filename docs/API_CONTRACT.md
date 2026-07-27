# Frontend API contract

The frontend uses an existing model catalog endpoint for live estimates and is prepared
for a separate model-comparison endpoint. The frontend base URL is configured with
`VITE_API_BASE_URL`.

## Model catalog and live estimate

When the questionnaire opens, the frontend requests:

`GET /api/v1/models`

```json
{
  "region": "eastus",
  "currency": "USD",
  "models": [
    {
      "id": "gpt-4.1",
      "name": "GPT-4.1",
      "inputPer1K": 0.002,
      "outputPer1K": 0.008
    }
  ],
  "infrastructure": {
    "aiSearchBasicPerHour": 0.14,
    "blobStoragePerGB": 0.02,
    "appServiceB1PerHour": 0.075
  }
}
```

The model ID is the stable form value. The returned names and prices are display and
live-calculation data. Models without both token prices remain visible but cannot be
selected.

After a model is selected, the browser recalculates only that selected setup whenever an
answer changes. It does not generate comparison models or send questionnaire data before
the final review action.

## Planned model-comparison endpoint

The final review action sends:

`POST /api/v1/model-comparisons`

The path can be overridden with `VITE_MODEL_COMPARISONS_PATH` while the backend contract
is being implemented.

### Request

```json
{
  "selectedModelId": "gpt-4.1",
  "resources": {
    "compute": true
  },
  "openai": {
    "users": 500,
    "requestsPerDay": 5,
    "avgPromptTokens": 800,
    "avgCompletionTokens": 400
  },
  "rag": {
    "enabled": true,
    "avgDocTokens": 600
  },
  "storage": {
    "docStorageGB": 5
  },
  "global": {
    "growthPct": 10
  }
}
```

The request deliberately contains no:

- Client-generated scenarios or option IDs
- Comparison model names
- Model family or relationship hints
- Catalog prices
- Browser-calculated totals

The backend owns model-family discovery, comparison selection, ordering, labels, reasons,
configuration choices, and final calculations.

### Successful response

```json
{
  "currency": "USD",
  "totalMonthlyRequests": 75000,
  "cheapestId": "compact",
  "warnings": [],
  "comparisons": [
    {
      "id": "selected",
      "label": "Selected model",
      "relationship": "selected",
      "reason": "This is the model selected in the questionnaire.",
      "model": {
        "id": "gpt-4.1",
        "name": "GPT-4.1",
        "family": "gpt-4.1",
        "tier": "flagship"
      },
      "configuration": {
        "ragEnabled": true,
        "computeEnabled": true
      },
      "estimate": {
        "name": "GPT-4.1 + your content",
        "breakdown": {
          "openai": 95.15,
          "rag": 102.2,
          "storage": 0.1,
          "compute": 54.75
        },
        "monthlyTotal": 252.2,
        "annualTotal": 5388.94,
        "costPerUser": 0.5044,
        "costPerConversation": 0.0034,
        "nextMonthProjected": 277.42
      }
    },
    {
      "id": "compact",
      "label": "Compact family member",
      "relationship": "smaller-family-member",
      "reason": "A lower-cost member of the selected model family.",
      "model": {
        "id": "gpt-4.1-mini",
        "name": "GPT-4.1 mini",
        "family": "gpt-4.1",
        "tier": "compact"
      },
      "configuration": {
        "ragEnabled": true,
        "computeEnabled": true
      },
      "estimate": {
        "name": "GPT-4.1 mini + your content",
        "breakdown": {
          "openai": 35.1,
          "rag": 102.2,
          "storage": 0.1,
          "compute": 54.75
        },
        "monthlyTotal": 192.15,
        "annualTotal": 4105.65,
        "costPerUser": 0.3843,
        "costPerConversation": 0.0026,
        "nextMonthProjected": 211.37
      }
    }
  ]
}
```

Response requirements:

- `comparisons` contains one or more items in backend-controlled display order.
- IDs are unique and opaque; the frontend does not assume `A`, `B`, or `C`.
- `cheapestId` is `null` or references one returned comparison.
- Each item supplies its own RAG and compute configuration.
- Costs may be `null` when the response includes an explanatory warning.
- The frontend renders the model, label, relationship, reason, and estimate exactly from
  each returned item.

### Error response

```json
{
  "code": "INVALID_COMPARISON_INPUT",
  "message": "One or more assumptions are invalid.",
  "fieldErrors": {
    "openai.users": "Input should be greater than or equal to 1."
  }
}
```

## Draft storage

Questionnaire answers and the current step are stored under
`azure-cost-coach:estimate-draft:v2`. The draft is not sent anywhere until the user
selects **Compare option costs**. API results, credentials, and secrets are not persisted.
