"use client";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { useForgotPasswordForm } from "@/features/auth/hooks/useForgotPasswordForm";

export function ForgotPasswordPage() {
  const {
    values,
    errors,
    submitError,
    isSubmitting,
    isSent,
    setField,
    onSubmit,
  } = useForgotPasswordForm();

  return (
    <AuthShell>
      <AuthCard>
        <form onSubmit={onSubmit} className="px-8 py-10 sm:px-12 sm:py-12">
          <h2 className="font-sans text-[1.2rem] font-semibold text-navy">
            Forgot Your Password?
          </h2>

          <div className="mt-8">
            <AuthInput
              id="reset-email"
              label="Email Address"
              hint="(Enter your email address to request a password reset.)"
              type="email"
              value={values.email}
              onChange={setField}
              placeholder="Enter your email"
              autoComplete="email"
              error={errors.email}
              disabled={isSubmitting}
            />
          </div>

          {submitError ? (
            <p className="mt-4 text-center text-sm text-red-500">
              {submitError}
            </p>
          ) : null}

          <div className="mt-10 flex justify-center">
            <AuthButton type="submit" loading={isSubmitting}>
              {isSent ? "Sent →" : "Send →"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
