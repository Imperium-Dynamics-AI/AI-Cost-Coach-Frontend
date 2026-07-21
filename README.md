# Azure AI Cost Coach

Azure AI Cost Coach is a proof-of-concept web application for estimating and comparing the monthly cost of common Azure AI solution patterns.

The repository is intentionally split into two top-level applications:

```text
AI-Cost-Coach/
|-- frontend/                 React/Vite user interface
|-- backend/                  Reserved for the future pricing API
|-- docs/                     Architecture and API hand-off notes
|-- .editorconfig
|-- .gitignore
`-- README.md
```

## Run the frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The default environment uses a safe placeholder API response, so the form can be reviewed before a backend exists. No prices are invented in placeholder mode.

## Frontend commands

```bash
npm run dev       # Start the local development server
npm run build     # Create a production build
npm run lint      # Run static code checks
npm test          # Verify the backend payload mapping
npm run preview   # Preview the production build locally
```

## Backend hand-off

The `backend/` directory is deliberately empty apart from `.gitkeep`. When the backend is added, implement the contract documented in [docs/API_CONTRACT.md](docs/API_CONTRACT.md) and configure the frontend with:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

The frontend sends estimates to `POST /api/v1/cost-estimates`. All pricing logic belongs in the backend; the browser only gathers inputs and presents results.
