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

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request into `dev`, `test`, or `main`, and
on the push that lands there: `npm ci`, then lint, tests, and a production build. The
build step is part of CI because it catches broken imports that lint and unit tests miss.

## Deployment

`.github/workflows/deploy.yml` deploys `frontend/dist` to Azure Static Web Apps on every
push to a promotion branch:

| Branch | Environment |
|---|---|
| `dev` | dev |
| `test` | staging |
| `main` | prod |

Authentication is OIDC — there is no Azure secret in this repository. The Static Web App
deployment token is read at deploy time with `az staticwebapp secrets list` and masked in
the log, so there is no long-lived token to rotate or leak.

Each GitHub Environment supplies its own variables: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_SWA_NAME`, and
`VITE_API_BASE_URL`. They are created by `infra/scripts/setup-app-cicd.ps1` in the infra
repository.

`VITE_API_BASE_URL` is inlined into the bundle at build time rather than read at runtime,
so changing it requires a new build, not a restart. The deploy fails fast if it is unset,
rather than shipping a frontend that cannot reach its API.
