"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/features/auth/api/errors";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useEntraLogin() {
  const router = useRouter();
  const { loginWithEntra } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLoginWithEntra() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await loginWithEntra();
      if (result.kind === "redirect") {
        window.location.assign(result.url);
        return;
      }
      router.replace("/dashboard");
    } catch (caught) {
      setError(
        getErrorMessage(caught, "Microsoft Entra ID sign-in failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    error,
    onLoginWithEntra,
  };
}
