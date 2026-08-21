"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { authApi } from "@/features/auth/api";
import { AuthApiError } from "@/features/auth/api/errors";
import { tokenStorage } from "@/features/auth/storage/tokenStorage";
import type {
  AuthSession,
  EntraLoginResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  SignupRequest,
  SignupResult,
  User,
} from "@/features/auth/types/auth";

export type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginRequest) => Promise<AuthSession>;
  signup: (payload: SignupRequest) => Promise<SignupResult>;
  loginWithEntra: () => Promise<EntraLoginResult>;
  requestPasswordReset: (
    payload: ForgotPasswordRequest,
  ) => Promise<ForgotPasswordResponse>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const emptySubscribe = () => () => undefined;

export function AuthProvider({ children }: AuthProviderProps) {
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const stored = useSyncExternalStore(
    tokenStorage.subscribe,
    tokenStorage.read,
    () => null,
  );

  const user = hasMounted ? (stored?.user ?? null) : null;
  const accessToken = hasMounted ? (stored?.accessToken ?? null) : null;
  const isInitializing = !hasMounted;

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void authApi.getCurrentUser(accessToken).catch((error: unknown) => {
      if (error instanceof AuthApiError && error.status === 401) {
        tokenStorage.clear();
      }
    });
  }, [accessToken]);

  const login = useCallback(async (payload: LoginRequest) => {
    const session = await authApi.login(payload);
    tokenStorage.write(session);
    return session;
  }, []);

  const signup = useCallback(async (payload: SignupRequest) => {
    const result = await authApi.signup(payload);
    if (result.kind === "session") {
      tokenStorage.write(result.session);
    }
    return result;
  }, []);

  const loginWithEntra = useCallback(async () => {
    const result = await authApi.loginWithEntra();
    if (result.kind === "session") {
      tokenStorage.write(result.session);
    }
    return result;
  }, []);

  const requestPasswordReset = useCallback(
    (payload: ForgotPasswordRequest) => authApi.requestPasswordReset(payload),
    [],
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch {
        // Local sign-out still proceeds if the API call fails.
      }
    }
    tokenStorage.clear();
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      login,
      signup,
      loginWithEntra,
      requestPasswordReset,
      logout,
    }),
    [
      user,
      accessToken,
      isInitializing,
      login,
      signup,
      loginWithEntra,
      requestPasswordReset,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
