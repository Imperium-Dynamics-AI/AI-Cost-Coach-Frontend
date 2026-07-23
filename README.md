# Azure AI Cost Coach

Azure AI Cost Coach is a full-stack proof-of-concept for estimating and comparing the monthly cost of Azure AI solution patterns.

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
- Node.js 20.19 or newer and npm
- Internet access when the backend first starts, because it downloads Azure retail prices into its local SQLite cache

## First-time setup and run

The application uses two development servers. Keep the backend running in one terminal and the frontend running in a second terminal.

### Terminal 1 — backend

Run these commands from the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend initializes its database, downloads the current Azure prices, and then starts at:

- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Cost endpoint: `POST http://127.0.0.1:8000/api/v1/cost-estimates`

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
```

If `frontend/.env` already exists, do not copy the example over it; confirm the two settings above and restart `npm run dev` after making changes.

## Normal daily startup

After completing the first-time installation, use these shorter commands.

Backend terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
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
        | POST /api/v1/cost-estimates
        v
FastAPI at localhost:8000
        |
        | reads cached Azure retail prices
        v
SQLite price cache
```

The browser collects supported inputs and displays results. All price lookup and cost calculations stay in the backend. The exact payload and response are documented in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

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
python -m uvicorn main:app --reload
```

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check API health and price-cache status |
| `POST` | `/api/v1/cost-estimates` | Calculate and compare scenarios A, B, and C |
| `GET` | `/prices` | Inspect all cached price records |
| `GET` | `/prices/by-service/{service_name}` | Filter cached records by Azure service |
| `GET` | `/prices/{sku_key}` | Inspect one cached SKU |

Additional backend details are available in [backend/README.md](backend/README.md).

## Troubleshooting

### PowerShell blocks virtual-environment activation

Allow scripts only for the current terminal and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### The frontend says it cannot reach the estimate API

1. Confirm the backend terminal is still running.
2. Open [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).
3. Confirm `VITE_USE_MOCK_API=false` in `frontend/.env`.
4. Confirm `VITE_API_BASE_URL=http://localhost:8000`.
5. Restart the frontend after changing `.env`.

### The health endpoint reports `empty_cache`

The initial Azure price download did not populate the database. Check the backend terminal for network or Azure Retail Prices API errors, then restart the backend when internet access is available.

### Port 8000 or 5173 is already in use

Stop the process already using the port, or run the affected server on another port. If the backend port changes, update `VITE_API_BASE_URL` in `frontend/.env` and restart Vite.
