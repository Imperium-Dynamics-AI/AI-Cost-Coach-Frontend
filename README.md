# Azure AI Cost Coach — Frontend

Next.js, TypeScript, and Tailwind CSS frontend for Azure AI Cost Coach. The app starts on the sign-in flow. Auth currently runs on dummy data so the screens can be used before the backend APIs are connected.

Backend repository: [AI-Cost-Coach-Backend](https://github.com/Imperium-Dynamics-AI/AI-Cost-Coach-Backend)

## Prerequisites

- Node.js 20.19 or newer
- npm

## Local setup

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign-in is the starting page.

### Dummy accounts

| Flow | Values |
|---|---|
| Email sign-in | `demo@imperium.com` / `Password123!` |
| Invitation codes | `IMPERIUM-2026` or `COACH-INVITE` |
| Microsoft Entra ID | Dummy Entra user, no credentials required |

## Connecting real APIs later

Auth lives in `frontend/src/features/auth`. Screens, hooks, and context talk to an `AuthApi` interface. To switch off dummy data:

1. Set `NEXT_PUBLIC_USE_MOCK_AUTH=false`
2. Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin
3. Adjust endpoint paths in `frontend/src/features/auth/config/authConfig.ts` if the backend contract differs

Do not change form components for the swap. The HTTP client in `frontend/src/features/auth/api/httpAuthApi.ts` already matches the same request and response types as the dummy implementation.

## Commands

Run these inside `frontend/`:

```powershell
npm run dev       # Start the Next.js development server
npm run build     # Create the static production build
npm run lint      # Run ESLint
npm test          # Run frontend tests
```

## Repository structure

```text
AI-Cost-Coach-Frontend/
|-- frontend/                 Next.js application
|   `-- src/features/auth/    Login, signup, Entra, and password reset
|-- .github/workflows/        Validation and Azure Static Web Apps deployment
`-- README.md
```
