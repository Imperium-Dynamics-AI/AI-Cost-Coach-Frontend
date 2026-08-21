import type { FieldErrors } from "@/features/auth/types/auth";

export class AuthApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      fieldErrors?: FieldErrors;
    } = {},
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = options.status ?? 400;
    this.code = options.code ?? "AUTH_ERROR";
    this.fieldErrors = options.fieldErrors;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
