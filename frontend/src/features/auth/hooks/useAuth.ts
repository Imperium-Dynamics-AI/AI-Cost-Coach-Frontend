"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/AuthProvider";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
