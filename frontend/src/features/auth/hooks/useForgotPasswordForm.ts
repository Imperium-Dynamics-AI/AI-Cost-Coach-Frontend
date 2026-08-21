"use client";

import { useState, type FormEvent } from "react";
import { AuthApiError, getErrorMessage } from "@/features/auth/api/errors";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  FieldErrors,
  ForgotPasswordRequest,
} from "@/features/auth/types/auth";
import {
  hasFieldErrors,
  validateForgotPassword,
} from "@/features/auth/utils/validation";

const INITIAL_VALUES: ForgotPasswordRequest = {
  email: "",
};

export function useForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [values, setValues] = useState<ForgotPasswordRequest>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function setField(value: string) {
    setValues({ email: value });
    setErrors({});
    setSubmitError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForgotPassword(values);

    if (hasFieldErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await requestPasswordReset(values);
      setIsSent(true);
    } catch (error) {
      if (error instanceof AuthApiError && error.fieldErrors) {
        setErrors(error.fieldErrors);
      }
      setSubmitError(
        getErrorMessage(error, "Unable to send a reset email. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitError,
    isSubmitting,
    isSent,
    setField,
    onSubmit,
  };
}
