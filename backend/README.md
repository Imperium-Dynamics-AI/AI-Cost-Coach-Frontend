# Azure Pricing Cache Backend

This is the backend service for the **Azure AI Cost Coach**. It fetches real-time retail pricing data from the official Microsoft Azure Pricing API, stores it in a local SQLite cache database, and exposes REST API endpoints for consumption.

---

## Technical Stack
* **FastAPI**: Modern, high-performance web framework for building APIs.
* **SQLModel**: Relational database mapping using Pydantic and SQLAlchemy.
* **SQLite**: Local relational database for zero-configuration pricing cache storage.
* **APScheduler**: Asynchronous task scheduler to keep pricing data updated.
* **HTTPX**: Non-blocking HTTP client for fetching data from the Azure API.

---

## Setup and Running Locally

Follow these steps to run the backend service on your local machine:

### 1. Set up a Virtual Environment
Navigate to the `backend/` directory and create a Python virtual environment:
```bash
cd backend
python -m venv venv
```

### 2. Activate the Virtual Environment
* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the API Server
Start the development server with hot-reloading:
```bash
uvicorn main:app --reload
```

---

## API Endpoints

Once the server is running, the following endpoints are available:

* **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Use this to test queries interactively)
* **System Health & Cache Age**: `GET /health`
* **Fetch All Cached Prices**: `GET /prices`
* **Filter Prices by Service**: `GET /prices/by-service/{service_name}` (e.g. `/prices/by-service/openai`)
* **Look up Single SKU Price**: `GET /prices/{sku_key}` (e.g. `/prices/blob-storage-gb`)

---

## Background Synchronization
* The server automatically checks and fetches fresh prices from the Azure Retail Prices API on startup.
* A background scheduler (`AsyncIOScheduler`) runs every **24 hours** to refresh the local cache database.
* To force a manual database refresh, simply delete the local database file `azure_prices.db` and restart the server.
