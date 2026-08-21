"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthTabs } from "@/features/auth/components/AuthTabs";
import { EntraIdPanel } from "@/features/auth/components/EntraIdPanel";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AuthTab } from "@/features/auth/types/auth";

export function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const [tab, setTab] = useState<AuthTab>("signin");

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitializing, router]);

  return (
    <AuthShell onSignInClick={() => setTab("signin")}>
      <AuthCard>
        <AuthTabs activeTab={tab} onChange={setTab} />
        {tab === "signin" ? (
          <div className="grid md:grid-cols-2 md:divide-x md:divide-[#8C52FB29]">
            <SignInForm />
            <EntraIdPanel />
          </div>
        ) : (
          <SignUpForm />
        )}
      </AuthCard>
    </AuthShell>
  );
}
