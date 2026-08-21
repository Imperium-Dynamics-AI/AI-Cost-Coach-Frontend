"use client";

import Link from "next/link";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function SignInForm() {
  const { values, errors, submitError, isSubmitting, setField, onSubmit } =
    useLoginForm();

  return (
    <form onSubmit={onSubmit} className="flex flex-col px-8 py-8 sm:px-10">
      <h2 className="font-sans text-[1.2rem] font-semibold text-navy">
        Sign into your Account
      </h2>

      <div className="mt-6 space-y-5">
        <AuthInput
          id="signin-email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(value) => setField("email", value)}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
          disabled={isSubmitting}
        />
        <AuthInput
          id="signin-password"
          label="Password"
          type="password"
          value={values.password}
          onChange={(value) => setField("password", value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Link
          href="/forgot-password"
          className="font-sans text-xs text-navy/40 transition hover:text-purple"
        >
          Forgot Password?
        </Link>
      </div>

      {submitError ? (
        <p className="mt-4 text-center text-sm text-red-500">{submitError}</p>
      ) : null}

      <div className="mt-8 flex justify-center">
        <AuthButton type="submit" loading={isSubmitting}>
          Sign In
        </AuthButton>
      </div>
    </form>
  );
}
