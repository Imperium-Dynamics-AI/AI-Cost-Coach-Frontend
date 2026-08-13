# Azure AI Cost Coach — Frontend

React 19 and Vite frontend for Azure AI Cost Coach. The application collects workload details, estimates the selected Azure AI setup, and compares it with nearby catalog models through the separate FastAPI backend.

Backend repository: [AI-Cost-Coach-Backend](https://github.com/Imperium-Dynamics-AI/AI-Cost-Coach-Backend)

## Prerequisites

- Node.js 20.19 or newer
- npm
- A running AI Cost Coach backend, unless mock API mode is enabled

## Local setup

Run these commands from the repository root:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Open the URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

Configure `frontend/.env` for a local backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite server after changing environment variables.

## Commands

Run these inside `frontend/`:

```powershell
npm run dev       # Start the development server
npm run build     # Create the production build
npm run lint      # Run ESLint
npm test          # Run frontend tests
npm run preview   # Preview the production build
```

## Repository structure

```text
AI-Cost-Coach-Frontend/
|-- frontend/                 React and Vite application
|-- docs/                     Frontend architecture and API integration contract
|-- .github/workflows/        Validation and Azure Static Web Apps deployment
|-- .editorconfig
|-- .gitignore
`-- README.md
```

The frontend architecture is documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The request and response integration contract is documented in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Backend connection

When mock mode is disabled, the frontend expects these backend operations:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/models` | Load model and infrastructure rates |
| `POST` | `/api/v1/cost-estimates` | Calculate comparison scenarios |

Backend setup, API implementation, and server commands belong to the [backend repository](https://github.com/Imperium-Dynamics-AI/AI-Cost-Coach-Backend).

## Deployment

GitHub Actions deploys `frontend/` to Azure Static Web Apps. Configure the repository variable `VITE_API_BASE_URL` with the deployed backend URL and keep the Azure deployment token in the repository secret expected by the deployment workflow.
