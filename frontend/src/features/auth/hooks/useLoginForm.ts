"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthApiError, getErrorMessage } from "@/features/auth/api/errors";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { FieldErrors, LoginRequest } from "@/features/auth/types/auth";
import { hasFieldErrors, validateLogin } from "@/features/auth/utils/validation";

const INITIAL_VALUES: LoginRequest = {
  email: "",
  password: "",
};

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [values, setValues] = useState<LoginRequest>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof LoginRequest>(field: K, value: LoginRequest[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLogin(values);

    if (hasFieldErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login(values);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof AuthApiError && error.fieldErrors) {
        setErrors(error.fieldErrors);
      }
      setSubmitError(getErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitError,
    isSubmitting,
    setField,
    onSubmit,
  };
}
