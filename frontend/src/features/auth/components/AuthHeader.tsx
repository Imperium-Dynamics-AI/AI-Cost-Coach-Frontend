"use client";

import Link from "next/link";
import { ImperiumLogo } from "@/features/auth/components/ImperiumLogo";

type AuthHeaderProps = {
  onSignInClick?: () => void;
};

const signInClassName =
  "cursor-pointer rounded-lg bg-brand px-5 py-2 font-sans text-sm font-semibold text-white transition hover:brightness-95";

export function AuthHeader({ onSignInClick }: AuthHeaderProps) {
  return (
    <header className="relative z-20 flex h-[72px] items-center justify-between bg-white px-6 sm:px-10">
      <Link href="/" aria-label="Azure AI Cost Coach home">
        <ImperiumLogo />
      </Link>
      {onSignInClick ? (
        <button type="button" onClick={onSignInClick} className={signInClassName}>
          SignIn
        </button>
      ) : (
        <Link href="/" className={signInClassName}>
          SignIn
        </Link>
      )}
    </header>
  );
}
