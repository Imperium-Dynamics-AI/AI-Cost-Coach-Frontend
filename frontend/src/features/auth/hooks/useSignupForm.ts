"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthApiError, getErrorMessage } from "@/features/auth/api/errors";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { FieldErrors, SignupRequest } from "@/features/auth/types/auth";
import { hasFieldErrors, validateSignup } from "@/features/auth/utils/validation";

const INITIAL_VALUES: SignupRequest = {
  firstName: "",
  lastName: "",
  email: "",
  invitationCode: "",
};

export function useSignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [values, setValues] = useState<SignupRequest>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof SignupRequest>(
    field: K,
    value: SignupRequest[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignup(values);

    if (hasFieldErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setPendingMessage(null);

    try {
      const result = await signup(values);
      if (result.kind === "pending") {
        setPendingMessage(result.message);
        return;
      }
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof AuthApiError && error.fieldErrors) {
        setErrors(error.fieldErrors);
      }
      setSubmitError(
        getErrorMessage(error, "Unable to create your account. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitError,
    pendingMessage,
    isSubmitting,
    setField,
    onSubmit,
  };
}
