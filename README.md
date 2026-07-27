# Azure AI Cost Coach

Azure AI Cost Coach is a full-stack proof-of-concept that guides a business user through a short questionnaire, calculates the selected setup live, and displays model-family comparisons selected by a backend service.

```text
AI-Cost-Coach/
|-- frontend/                 React 19 + Vite user interface
|-- backend/                  FastAPI pricing and calculation service
|-- docs/                     Architecture and API contract
|-- .editorconfig
|-- .gitignore
`-- README.md
```

## Prerequisites

Install these before the first run:

- Python 3.10 or newer
- PDM
- Node.js 20.19 or newer and npm
- Internet access when the backend first starts, because it downloads Azure retail prices into its local SQLite cache

## First-time setup and run

The application uses two development servers. Keep the backend running in one terminal and the frontend running in a second terminal.

### Terminal 1 — backend

Run these commands from the repository root:

```powershell
cd backend
pdm install
pdm run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

The backend initializes its database, downloads the current Azure prices, and then starts at:

- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Model catalog: `GET http://127.0.0.1:8000/api/v1/models`

Wait until the terminal reports that startup and the initial price sync have completed before requesting an estimate. The generated `azure_prices.db` file is local runtime data and is ignored by Git.

### Terminal 2 — frontend

Open a second PowerShell terminal at the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL printed by Vite, normally:

[http://localhost:5173](http://localhost:5173)

The frontend environment must contain:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
VITE_MODEL_COMPARISONS_PATH=/api/v1/model-comparisons
```

If `frontend/.env` already exists, do not copy the example over it; confirm the two settings above and restart `npm run dev` after making changes.

## Normal daily startup

After completing the first-time installation, use these shorter commands.

Backend terminal:

```powershell
cd backend
pdm run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend terminal:

```powershell
cd frontend
npm run dev
```

Press `Ctrl+C` in each terminal to stop its server.

## How the applications connect

```text
Browser at localhost:5173
        |
        | GET /api/v1/models
        v
FastAPI at localhost:8000
        |
        | reads cached Azure retail prices
        v
SQLite price cache

Browser recalculates the selected setup as answers change
        |
        | POST /api/v1/model-comparisons after final review
        v
Comparison API selects related models and returns ordered results
```

The browser gets available models and rates from the backend, calculates the current
selection locally, and sends only the selected model ID and raw inputs after the final
review action. The current backend does not yet implement the model-comparison endpoint;
real-mode final submission will fail until that endpoint is added. The exact planned
payload and response are documented in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Frontend commands

Run these inside `frontend/`:

```powershell
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run static code checks
npm test          # Verify the frontend-to-backend payload mapping
npm run preview   # Preview the production build locally
```

## Backend commands and endpoints

Run the backend from inside `backend/` so its local imports and SQLite path resolve correctly.

```powershell
pdm run uvicorn src.main:app --reload
```

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check API health and price-cache status |
| `GET` | `/api/v1/models` | Return model and infrastructure rates for live frontend estimates |
| `POST` | `/api/v1/model-comparisons` | Planned endpoint that selects related models and returns their comparisons |
| `POST` | `/api/v1/cost-estimates` | Legacy endpoint retained by the backend; the frontend no longer calls it |
| `GET` | `/prices` | Inspect all cached price records |
| `GET` | `/prices/by-service/{service_name}` | Filter cached records by Azure service |
| `GET` | `/prices/{sku_key}` | Inspect one cached SKU |

Additional backend details are available in [backend/README.md](backend/README.md).

## Troubleshooting

### PowerShell cannot find PDM

Install PDM, then open a new terminal so the command is available:

```powershell
python -m pip install --user pdm
```

### The frontend says it cannot reach the comparison API

1. Confirm the backend terminal is still running.
2. Open [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).
3. Confirm `VITE_USE_MOCK_API=false` in `frontend/.env`.
4. Confirm `VITE_API_BASE_URL=http://localhost:8000`.
5. Confirm the backend has implemented `POST /api/v1/model-comparisons`.
6. Restart the frontend after changing `.env`.

### The health endpoint reports `empty_cache`

The initial Azure price download did not populate the database. Check the backend terminal for network or Azure Retail Prices API errors, then restart the backend when internet access is available.

### Port 8000 or 5173 is already in use

Stop the process already using the port, or run the affected server on another port. If the backend port changes, update `VITE_API_BASE_URL` in `frontend/.env` and restart Vite.
