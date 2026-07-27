# Cost estimate API contract

This document records how the guided frontend questionnaire maps a business user’s answers to the existing FastAPI endpoint. The frontend base URL is configured with `VITE_API_BASE_URL`.

## Endpoint

`POST /api/v1/cost-estimates`

```http
Content-Type: application/json
```

## Request with document search enabled

```json
{
  "resources": {
    "compute": false
  },
  "scenarios": [
    { "id": "A", "model": "GPT-4o", "forceRag": true },
    { "id": "B", "model": "GPT-4.1", "forceRag": true },
    { "id": "C", "model": "GPT-4o", "forceRag": false }
  ],
  "openai": {
    "users": 500,
    "requestsPerDay": 5,
    "avgPromptTokens": 800,
    "avgCompletionTokens": 400
  },
  "rag": {
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

The selected model is written to Options A and C. Option B uses the other supported model. Options A and B use the user’s RAG choice, while Option C always uses the opposite RAG setting. All three options share the same usage, hosting, and growth assumptions.

The results UI displays scenarios `A`, `B`, and `C` as clickable **Option A**, **Option B**, and **Option C** cards. Selecting an option shows its detailed cost breakdown; the side-by-side summary remains available below it.

When the user disables document search:

- Options A and B have `forceRag: false`.
- Option C has `forceRag: true`.
- The `rag` and `storage` objects remain in the payload because Option C uses them.

## Questionnaire mapping

| Business question | Request field | Backend behavior |
|---|---|---|
| Which AI model should be primary? | `scenarios[0].model` | Prices the user’s selected model first |
| Alternative model | `scenarios[1].model` | Automatically prices the other supported model for comparison |
| Use business documents? | Options A and B `forceRag` | Applies the selected RAG setting to both model choices |
| Opposite RAG comparison | Option C `forceRag` | Prices the selected model with the opposite RAG setting |
| Active people | `openai.users` | Multiplies monthly request volume |
| Interactions per person/day | `openai.requestsPerDay` | Multiplies request volume using 30 days |
| Average input size | `openai.avgPromptTokens` | Calculates model input-token cost |
| Average response size | `openai.avgCompletionTokens` | Calculates model output-token cost |
| Retrieved document text | `rag.avgDocTokens` | Adds document context to each prompt when RAG is enabled |
| Source documents stored | `storage.docStorageGB` | Calculates Blob Storage cost when RAG is enabled |
| Include app hosting? | `resources.compute` | Includes one Basic B1 App Service instance |
| Expected monthly growth | `global.growthPct` | Calculates next-month and compounded annual projections |

## Successful response

```json
{
  "currency": "USD",
  "totalMonthlyRequests": 75000,
  "cheapestId": "C",
  "warnings": [],
  "scenarios": {
    "A": {
      "name": "GPT-4o + RAG",
      "breakdown": {
        "openai": 120.5,
        "rag": 70,
        "storage": 0.1,
        "compute": 0,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 190.6,
      "annualTotal": 4068.46,
      "costPerUser": 0.3812,
      "costPerConversation": 0.0025,
      "nextMonthProjected": 209.66
    },
    "B": {
      "name": "GPT-4.1 + RAG",
      "breakdown": {
        "openai": 146.25,
        "rag": 70,
        "storage": 0.1,
        "compute": 0,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 216.35,
      "annualTotal": 4618.45,
      "costPerUser": 0.4327,
      "costPerConversation": 0.0029,
      "nextMonthProjected": 237.99
    },
    "C": {
      "name": "GPT-4o",
      "breakdown": {
        "openai": 90.25,
        "rag": 0,
        "storage": 0,
        "compute": 0,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 90.25,
      "annualTotal": 1926.13,
      "costPerUser": 0.1805,
      "costPerConversation": 0.0012,
      "nextMonthProjected": 99.28
    }
  }
}
```

If a required cached price is unavailable, affected values may be `null` and the backend includes an explanation in `warnings`.

## Validation error

The backend returns invalid inputs with HTTP `422`:

```json
{
  "code": "INVALID_ESTIMATE_INPUT",
  "message": "One or more assumptions are invalid.",
  "fieldErrors": {
    "openai.users": "Input should be greater than or equal to 1."
  }
}
```

## Draft storage

Questionnaire answers and the current step are saved locally under `azure-cost-coach:estimate-draft:v1`. This browser draft is not sent anywhere until the user selects **Compare option costs**. API results, credentials, and secrets are never stored in the draft.
