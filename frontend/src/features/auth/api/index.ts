import { dummyAuthApi } from "@/features/auth/api/dummyAuthApi";
import { httpAuthApi } from "@/features/auth/api/httpAuthApi";
import { AUTH_CONFIG } from "@/features/auth/config/authConfig";
import type { AuthApi } from "@/features/auth/types/auth";

export const authApi: AuthApi = AUTH_CONFIG.useMock
  ? dummyAuthApi
  : httpAuthApi;
