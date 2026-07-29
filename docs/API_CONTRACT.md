# Frontend API contract

The frontend uses the existing model catalog and cost-estimate endpoints for live and
final comparisons. The frontend base URL is configured with `VITE_API_BASE_URL`.

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

After a model is selected, the browser recalculates only that setup whenever an answer
changes. It does not generate comparison scenarios or send questionnaire data until the
final review action.

## Model comparison (implemented via the existing cost-estimates endpoint)

`POST /api/v1/model-comparisons` was never implemented on the backend and is not used.
Instead, the final review action builds comparisons client-side and prices them through
the existing `POST /api/v1/cost-estimates` endpoint:

1. The frontend ranks every fully-priced catalog model (from `GET /api/v1/models`) by
   model-token cost for the exact usage entered in the questionnaire (`src/features/
   cost-estimator/utils/pickComparisonModels.js`). Shared infrastructure costs do not
   affect the ordering.
2. It picks the selected model plus its nearest strictly lower- and higher-cost neighbor
   (whichever exist). Equal-cost entries are not mislabeled as cheaper or pricier.
3. It sends one `POST /api/v1/cost-estimates` request with one scenario per model —
   `{ id, model, forceRag }` — where every scenario shares identical deployment
   assumptions (users, tokens, RAG, compute, growth). Only the model differs.
4. The response's `scenarios` map is joined back with frontend-generated model metadata,
   labels, relationships, and reasons to create the `comparisons[]` view model rendered
   by the UI.

No model-family or capability logic lives on the backend; "related models" means
"the nearest-priced neighbors for this exact usage," which is something the frontend
already has all the data to compute deterministically.

### Request

```json
{
  "resources": {
    "compute": true
  },
  "scenarios": [
    {
      "id": "selected",
      "model": "GPT-4.1",
      "forceRag": true
    },
    {
      "id": "cheaper",
      "model": "GPT-4.1 mini",
      "forceRag": true
    },
    {
      "id": "pricier",
      "model": "GPT-4o",
      "forceRag": true
    }
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

Scenario IDs, model names, and `forceRag` are generated from the catalog by the frontend.
The `openai`, `rag`, `storage`, `resources`, and `global` assumptions apply equally to
every scenario; only the model changes. When RAG is disabled, the frontend sends zero for
the unused RAG token and storage inputs.

The request deliberately contains no:

- Catalog prices
- Browser-calculated totals
- Browser-only comparison labels, relationships, or reasons

The frontend owns comparison selection, scenario order, labels, relationships, and
reasons. The backend calculates every supplied scenario and identifies the cheapest
scenario for which a complete monthly total is available.

### Successful response

```json
{
  "currency": "USD",
  "totalMonthlyRequests": 75000,
  "cheapestId": "cheaper",
  "warnings": [],
  "scenarios": {
    "selected": {
      "name": "GPT-4.1 + your content",
      "breakdown": {
        "openai": 450,
        "rag": 102.2,
        "storage": 0.1,
        "compute": 54.75,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 607.05,
      "annualTotal": 12981.33,
      "costPerUser": 1.2141,
      "costPerConversation": 0.0081,
      "nextMonthProjected": 667.76
    },
    "cheaper": {
      "name": "GPT-4.1 mini + your content",
      "breakdown": {
        "openai": 90,
        "rag": 102.2,
        "storage": 0.1,
        "compute": 54.75,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 247.05,
      "annualTotal": 5282.99,
      "costPerUser": 0.4941,
      "costPerConversation": 0.0033,
      "nextMonthProjected": 271.76
    },
    "pricier": {
      "name": "GPT-4o + your content",
      "breakdown": {
        "openai": 975,
        "rag": 102.2,
        "storage": 0.1,
        "compute": 54.75,
        "apim": 0,
        "monitoring": 0,
        "identity": 0,
        "finetuning": 0
      },
      "monthlyTotal": 1132.05,
      "annualTotal": 24208.08,
      "costPerUser": 2.2641,
      "costPerConversation": 0.0151,
      "nextMonthProjected": 1245.26
    }
  }
}
```

Response requirements:

- `scenarios` is keyed by the frontend-generated scenario IDs.
- `cheapestId` is `null` or references one returned scenario.
- Costs may be `null` when required pricing is unavailable. Any returned warnings are
  displayed with the comparison results.
- The frontend joins each returned scenario with its browser-only model metadata and
  renders the comparisons in the original scenario order.
- If the final backend totals differ from the catalog ranking, the frontend updates the
  displayed lower-cost, higher-cost, or same-cost label to match the final totals.

### Error response

```json
{
  "code": "INVALID_ESTIMATE_INPUT",
  "message": "One or more assumptions are invalid.",
  "fieldErrors": {
    "openai.users": "Input should be greater than or equal to 1"
  }
}
```

The frontend displays string `message`/`detail` errors and also supports the standard
FastAPI validation `detail` array.

## Draft storage

Questionnaire answers and the current step are stored under
`azure-cost-coach:estimate-draft:v2`. The draft is not sent anywhere until the user
selects **Compare option costs**. API results, credentials, and secrets are not persisted.
