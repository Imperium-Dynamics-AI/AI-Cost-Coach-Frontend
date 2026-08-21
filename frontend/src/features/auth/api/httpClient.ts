import { AUTH_CONFIG } from "@/features/auth/config/authConfig";
import { AuthApiError } from "@/features/auth/api/errors";

function getBaseUrl(): string {
  const baseUrl = AUTH_CONFIG.apiBaseUrl.replace(/\/$/, "");
  if (!baseUrl) {
    throw new AuthApiError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to frontend/.env before disabling mock auth.",
      { status: 500, code: "MISSING_API_BASE_URL" },
    );
  }
  return baseUrl;
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
        code?: string;
        fieldErrors?: Record<string, string>;
        data?: T;
      }
    | T
    | null;

  if (!response.ok) {
    const errorBody = payload as {
      message?: string;
      code?: string;
      fieldErrors?: Record<string, string>;
    } | null;

    throw new AuthApiError(
      errorBody?.message ?? "The request could not be completed.",
      {
        status: response.status,
        code: errorBody?.code,
        fieldErrors: errorBody?.fieldErrors,
      },
    );
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}
