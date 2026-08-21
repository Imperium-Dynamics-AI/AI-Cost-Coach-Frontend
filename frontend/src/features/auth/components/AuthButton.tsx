"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
};

export function AuthButton({
  children,
  loading = false,
  className,
  disabled,
  type = "button",
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-w-[132px] cursor-pointer items-center justify-center rounded-lg bg-brand px-8 py-2.5 font-sans text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
