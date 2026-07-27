# Azure AI Cost Coach — Backend API

This backend service powers the **Azure AI Cost Coach**. It fetches live retail pricing data from the official Azure Retail Prices API, caches it locally in SQLite, and provides REST endpoints for model rates and scenario calculation estimates for Azure AI deployments.

---

## Architecture & Features

* **Modular Directory Architecture**: Structured into clean `src/` modules (`config`, `core`, `models`, `schemas`, `services`, `api`) with single-responsibility files under 50–80 lines each.
* **Multi-Model Azure Pricing Sync (`src/services/azure_sync.py`)**: Automatically fetches retail rates for **12 popular OpenAI models** (GPT-4o, GPT-4o mini, GPT-4.1, GPT-4.1 mini, GPT-4.1 nano, GPT-4 Turbo, GPT-3.5 Turbo, o1, o1 mini, o3, o3 mini, o4-mini) plus infrastructure (AI Search, Blob Storage, App Service).
* **Model Catalog Endpoint (`GET /api/v1/models`)**: Returns input/output prices per 1K tokens + infrastructure rates in a single response, enabling dynamic client-side calculations in the React frontend.
* **SQLite Cache Database (`src/core/database.py`)**: Stores pricing data locally with zero configuration to ensure fast response times and zero external API dependencies during cost estimations.
* **Background Auto-Refresh**: Uses `AsyncIOScheduler` to refresh price caches every 24 hours.
* **Cost Calculation Engine (`src/services/calculator.py`)**: Implements formula calculations for token costs (including RAG document prompt context injection), AI Search hosting, storage growth, and App Service compute toggles. Provides side-by-side comparisons of **Scenarios A, B, and C**.
* **Docker Containerization**: Includes production `Dockerfile` and `.dockerignore` ready for Azure Container Registry (ACR) and Azure App Service deployment.

---

## Technical Stack

* **FastAPI**: High-performance Python web framework.
* **Pydantic v2 & SQLModel**: Data validation, request/response contracts, and SQLite ORM.
* **SQLite**: Embedded database for caching Azure retail rates.
* **APScheduler**: Asynchronous background scheduler for periodic price refreshes.
* **HTTPX**: Async HTTP client for Azure Retail Prices API integration.
* **Uvicorn**: Lightning-fast ASGI server implementation.

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
uvicorn src.main:app --reload
```
The server runs on **`http://127.0.0.1:8000`**.

---

## Docker Containerization

### Build Image Locally
```powershell
docker build -t ai-cost-coach-backend:v1 ./backend
```

### Run Container Locally
```powershell
docker run -d -p 8000:8000 --name backend-app ai-cost-coach-backend:v1
```

---

## API Endpoints

Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/models` | **OpenAI Model Catalog & Prices** — Primary endpoint for frontend dynamic calculations |
| `POST` | `/api/v1/cost-estimates` | **Cost Calculation Engine** — Computes monthly/annual costs & compares Scenarios A, B, C |
| `GET` | `/health` | System health check, cached SKU counts, and cache age monitoring |
| `GET` | `/prices` | Fetch all cached Azure price records |
| `GET` | `/prices/by-service/{service_name}` | Filter cached prices by service (e.g. `/prices/by-service/openai`) |
| `GET` | `/prices/{sku_key}` | Look up a specific SKU price by key (e.g. `/prices/gpt-4o-input`) |

---

## Primary Endpoint: `GET /api/v1/models`

Returns all cached OpenAI model input/output rates per 1K tokens along with infrastructure prices:

```json
{
  "region": "eastus",
  "currency": "USD",
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "inputPer1K": 0.0055,
      "outputPer1K": 0.0165
    },
    {
      "id": "gpt-4.1",
      "name": "GPT-4.1",
      "inputPer1K": 0.0022,
      "outputPer1K": 0.0088
    }
  ],
  "infrastructure": {
    "aiSearchBasicPerHour": 0.101,
    "blobStoragePerGB": 0.0208,
    "appServiceB1PerHour": 0.017
  }
}
```

---

## Directory Structure

```
backend/
├── Dockerfile                  # Container build recipe
├── .dockerignore               # Files excluded from container build
├── requirements.txt            # Package dependencies
├── README.md                   # Documentation & setup guide
└── src/
    ├── main.py                 # Lean application entrypoint (< 30 lines)
    ├── config/
    │   └── settings.py         # Application configuration & API settings
    ├── core/
    │   ├── database.py         # SQLite engine & init_db helper
    │   ├── dependencies.py     # FastAPI session dependency injection provider
    │   └── exceptions.py       # Custom 422 API contract validation error handler
    ├── models/
    │   └── price_cache.py      # SQLModel ORM definition for AzurePriceCache table
    ├── schemas/
    │   └── cost_estimate.py    # Pydantic request, response, and error schemas
    ├── services/
    │   ├── azure_sync.py       # Azure Retail Prices API sync & background scheduler
    │   └── calculator.py       # Pure calculation engine logic
    └── api/
        ├── router.py           # Main APIRouter combining all domain routers
        └── v1/
            ├── health.py       # GET /health monitoring endpoint
            ├── prices.py       # GET /prices raw cache lookup endpoints
            ├── models.py       # GET /api/v1/models catalog endpoint
            └── estimates.py    # POST /api/v1/cost-estimates endpoint
```
