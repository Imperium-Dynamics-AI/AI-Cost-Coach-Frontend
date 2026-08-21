import { describe, expect, it } from "vitest";
import {
  hasFieldErrors,
  isValidEmail,
  validateForgotPassword,
  validateLogin,
  validateSignup,
} from "@/features/auth/utils/validation";

describe("isValidEmail", () => {
  it("accepts a standard email", () => {
    expect(isValidEmail("demo@imperium.com")).toBe(true);
  });

  it("rejects an incomplete email", () => {
    expect(isValidEmail("demo@imperium")).toBe(false);
  });
});

describe("validateLogin", () => {
  it("requires email and password", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it("passes for complete credentials", () => {
    expect(
      hasFieldErrors(
        validateLogin({ email: "demo@imperium.com", password: "Password123!" }),
      ),
    ).toBe(false);
  });
});

describe("validateSignup", () => {
  it("requires every signup field", () => {
    const errors = validateSignup({
      firstName: "",
      lastName: "",
      email: "",
      invitationCode: "",
    });
    expect(Object.keys(errors)).toHaveLength(4);
  });
});

describe("validateForgotPassword", () => {
  it("requires a valid email", () => {
    expect(validateForgotPassword({ email: "not-an-email" }).email).toBeTruthy();
    expect(
      hasFieldErrors(validateForgotPassword({ email: "demo@imperium.com" })),
    ).toBe(false);
  });
});
