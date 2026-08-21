"use client";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { useEntraLogin } from "@/features/auth/hooks/useEntraLogin";

export function EntraIdPanel() {
  const { isSubmitting, error, onLoginWithEntra } = useEntraLogin();

  return (
    <div className="flex h-full flex-col px-8 py-8 sm:px-10">
      <h2 className="font-sans text-[1.2rem] font-semibold text-navy">
        Sign in with Entra ID
      </h2>
      <div className="mt-8">
        <AuthButton
          type="button"
          onClick={onLoginWithEntra}
          loading={isSubmitting}
          className="min-w-[210px]"
        >
          Microsoft Entra ID
        </AuthButton>
      </div>
      {error ? (
        <p className="mt-4 font-sans text-sm text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
