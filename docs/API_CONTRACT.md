# Cost estimate API contract

This document records the request currently sent by the frontend to the existing FastAPI calculation endpoint. The frontend base URL is configured with `VITE_API_BASE_URL`.

## Endpoint

`POST /api/v1/cost-estimates`

Request headers:

```http
Content-Type: application/json
```

## Request

The frontend intentionally sends only values consumed by the current calculation engine. Other fields accepted by the broader Pydantic schema are omitted until the backend uses them in a calculation.

```json
{
  "resources": {
    "compute": false
  },
  "scenarios": [
    { "id": "A", "model": "GPT-4o", "forceRag": false },
    { "id": "B", "model": "GPT-4.1", "forceRag": false },
    { "id": "C", "model": "GPT-4o", "forceRag": true }
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

### Field mapping

| Frontend input | Request field | How the backend uses it |
|---|---|---|
| Active people | `openai.users` | Multiplies monthly request volume |
| Interactions per person/day | `openai.requestsPerDay` | Multiplies monthly request volume using 30 days |
| Typical user message size | `openai.avgPromptTokens` | Calculates model input-token cost |
| Typical AI answer size | `openai.avgCompletionTokens` | Calculates model output-token cost |
| Document text per request | `rag.avgDocTokens` | Adds prompt tokens to the RAG scenario |
| Source documents stored | `storage.docStorageGB` | Calculates Blob Storage cost for the RAG scenario |
| Include App Service | `resources.compute` | Includes one cached Basic B1 App Service price |
| Expected monthly growth | `global.growthPct` | Calculates next-month and compounded annual projections |

Scenario definitions are controlled by the frontend and are not editable form inputs. `forceRag` makes Option C include AI Search, document storage, and retrieved document context.

## Successful response

All monetary values are numbers in the declared currency. A resource cost may be `null` only when the backend cannot find a required cached price; the backend includes a warning in that case.

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

The actual response contains entries for scenario IDs `A`, `B`, and `C`; the example abbreviates the repeated scenario structure.

## Error response

The backend returns validation failures with HTTP `422` and this stable shape:

```json
{
  "code": "INVALID_ESTIMATE_INPUT",
  "message": "One or more assumptions are invalid.",
  "fieldErrors": {
    "openai.users": "Input should be greater than or equal to 1."
  }
}
```
