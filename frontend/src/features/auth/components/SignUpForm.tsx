"use client";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { useSignupForm } from "@/features/auth/hooks/useSignupForm";

export function SignUpForm() {
  const {
    values,
    errors,
    submitError,
    pendingMessage,
    isSubmitting,
    setField,
    onSubmit,
  } = useSignupForm();

  return (
    <form onSubmit={onSubmit} className="flex flex-col px-8 py-8 sm:px-12">
      <h2 className="font-sans text-[1.2rem] font-semibold text-navy">
        Sign into your Account
      </h2>

      <div className="mt-6 space-y-5">
        <AuthInput
          id="signup-first-name"
          label="First Name"
          value={values.firstName}
          onChange={(value) => setField("firstName", value)}
          placeholder="Enter your First Name"
          autoComplete="given-name"
          error={errors.firstName}
          disabled={isSubmitting}
        />
        <AuthInput
          id="signup-last-name"
          label="Last Name"
          value={values.lastName}
          onChange={(value) => setField("lastName", value)}
          placeholder="Enter your Last Name"
          autoComplete="family-name"
          error={errors.lastName}
          disabled={isSubmitting}
        />
        <AuthInput
          id="signup-email"
          label="Email Address"
          type="email"
          value={values.email}
          onChange={(value) => setField("email", value)}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
          disabled={isSubmitting}
        />
        <AuthInput
          id="signup-invitation-code"
          label="Invitation Code"
          value={values.invitationCode}
          onChange={(value) => setField("invitationCode", value)}
          placeholder="Enter Invitation Code"
          autoComplete="off"
          error={errors.invitationCode}
          disabled={isSubmitting}
        />
      </div>

      {submitError ? (
        <p className="mt-4 text-center text-sm text-red-500">{submitError}</p>
      ) : null}

      {pendingMessage ? (
        <p className="mt-4 text-center font-sans text-sm text-purple">
          {pendingMessage}
        </p>
      ) : null}

      <div className="mt-8 flex justify-center">
        <AuthButton type="submit" loading={isSubmitting}>
          Sign Up
        </AuthButton>
      </div>
    </form>
  );
}
