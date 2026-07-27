# Azure AI Cost Coach — Backend API

This backend service powers the **Azure AI Cost Coach**. It fetches live retail pricing data from the official Azure Retail Prices API, caches it locally in SQLite, and provides a scenario calculation engine that computes monthly and annual estimates for Azure AI deployments.

---

## Architecture & Features

* **Azure Pricing Sync (`updater.py`)**: Automatically fetches retail rates for OpenAI models (GPT-4o, GPT-4.1), AI Search (Basic tier), Blob Storage (Hot LRS), and App Service (B1 tier) from `prices.azure.com`.
* **SQLite Cache Database (`database.py`)**: Stores pricing data locally with zero configuration to ensure fast response times and zero external API dependencies during cost estimations.
* **Background Auto-Refresh**: Uses `AsyncIOScheduler` to refresh price caches every 24 hours.
* **Cost Calculation Engine (`calculator.py` & `schemas.py`)**: Implements formula calculations for token costs (including RAG document prompt context injection), AI Search hosting, storage growth, and App Service compute toggles. Provides side-by-side comparisons of **Scenarios A, B, and C**.

---

## Technical Stack

* **FastAPI**: High-performance Python web framework.
* **Pydantic v2 & SQLModel**: Data validation, request/response contracts, and SQLite ORM.
* **SQLite**: Embedded database for caching Azure retail rates.
* **APScheduler**: Asynchronous background scheduler for periodic price refreshes.
* **HTTPX**: Async HTTP client for Azure Retail Prices API integration.

---

## Setup and Running Locally

### 1. Create & Activate Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows PowerShell
# source venv/bin/activate    # On macOS/Linux
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
```bash
uvicorn main:app --reload
```
The server runs on **`http://127.0.0.1:8000`**.

---

## API Endpoints

Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/cost-estimates` | **Cost Calculation Engine** — Computes monthly/annual costs & compares Scenarios A, B, C |
| `GET` | `/health` | System health check, cached SKU counts, and cache age monitoring |
| `GET` | `/prices` | Fetch all cached Azure price records |
| `GET` | `/prices/by-service/{service_name}` | Filter cached prices by service (e.g. `/prices/by-service/openai`) |
| `GET` | `/prices/{sku_key}` | Look up a specific SKU price by key (e.g. `/prices/gpt-4o-input`) |

---

## Cost Calculation Engine Endpoint

### `POST /api/v1/cost-estimates`

#### Sample Request Body
```json
{
  "scenarios": [
    { "id": "A", "model": "GPT-4o", "forceRag": false },
    { "id": "B", "model": "GPT-4.1", "forceRag": false },
    { "id": "C", "model": "GPT-4o", "forceRag": true }
  ],
  "openai": {
    "users": 500,
    "requestsPerDay": 10,
    "avgPromptTokens": 300,
    "avgCompletionTokens": 600
  },
  "resources": {
    "compute": true,
    "rag": true
  },
  "storage": {
    "docStorageGB": 5
  },
  "rag": {
    "avgDocTokens": 600
  },
  "global": {
    "growthPct": 0
  }
}
```

#### Sample Response Body
```json
{
  "currency": "USD",
  "totalMonthlyRequests": 150000,
  "cheapestId": "B",
  "warnings": [],
  "scenarios": {
    "A": {
      "name": "GPT-4o",
      "breakdown": {
        "openai": 1597.50,
        "rag": 0.0,
        "storage": 0.0,
        "compute": 12.41,
        "apim": 0.0,
        "monitoring": 0.0,
        "identity": 0.0,
        "finetuning": 0.0
      },
      "monthlyTotal": 1609.91,
      "annualTotal": 19318.92,
      "costPerUser": 3.22,
      "costPerConversation": 0.0107,
      "nextMonthProjected": 1609.91
    }
  }
}
```

---

## File Structure

```
backend/
├── main.py           # FastAPI app instance, router endpoints, lifespan & health checks
├── calculator.py     # Pure calculation engine & scenario comparison logic
├── schemas.py        # Pydantic request/response/error schemas matching API contract
├── updater.py        # Azure Retail Prices API client & database upsert logic
├── database.py       # SQLModel ORM definition for AzurePriceCache & SQLite session helper
├── config.py         # App configuration & Azure API endpoints
├── requirements.txt  # Python package dependencies
└── README.md         # Documentation & setup guide
```
