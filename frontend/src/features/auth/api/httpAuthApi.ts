import { AUTH_CONFIG } from "@/features/auth/config/authConfig";
import { requestJson } from "@/features/auth/api/httpClient";
import type {
  AuthApi,
  AuthSession,
  EntraLoginResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  SignupRequest,
  SignupResult,
  User,
} from "@/features/auth/types/auth";

/**
 * Live HTTP implementation. Point `AUTH_CONFIG.endpoints` at the backend
 * contract when it is ready — request and response types stay the same.
 */
export const httpAuthApi: AuthApi = {
  login(payload: LoginRequest) {
    return requestJson<AuthSession>(AUTH_CONFIG.endpoints.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  signup(payload: SignupRequest) {
    return requestJson<SignupResult>(AUTH_CONFIG.endpoints.signup, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  requestPasswordReset(payload: ForgotPasswordRequest) {
    return requestJson<ForgotPasswordResponse>(
      AUTH_CONFIG.endpoints.forgotPassword,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  loginWithEntra() {
    return requestJson<EntraLoginResult>(AUTH_CONFIG.endpoints.entra, {
      method: "POST",
    });
  },

  getCurrentUser(accessToken: string) {
    return requestJson<User>(AUTH_CONFIG.endpoints.me, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  logout(accessToken: string) {
    return requestJson<void>(AUTH_CONFIG.endpoints.logout, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
