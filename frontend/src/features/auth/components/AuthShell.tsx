"use client";

import type { ReactNode } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthHero } from "@/features/auth/components/AuthHero";

type AuthShellProps = {
  children: ReactNode;
  onSignInClick?: () => void;
};

export function AuthShell({ children, onSignInClick }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuthHeader onSignInClick={onSignInClick} />
      <div
        className="relative flex flex-1 flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
      >
        <main className="relative z-10 mx-auto flex w-full max-w-[960px] flex-1 flex-col items-center px-4 pb-16 pt-12 sm:pt-14">
          <AuthHero />
          <div className="mt-8 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
