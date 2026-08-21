import { beforeEach, describe, expect, it } from "vitest";
import { AuthApiError } from "@/features/auth/api/errors";
import { dummyAuthApi, resetDummyUsers } from "@/features/auth/api/dummyAuthApi";

describe("dummyAuthApi", () => {
  beforeEach(() => {
    resetDummyUsers();
  });

  it("signs in a seeded user", async () => {
    const session = await dummyAuthApi.login({
      email: "demo@imperium.com",
      password: "Password123!",
    });

    expect(session.user.email).toBe("demo@imperium.com");
    expect(session.tokens.accessToken).toContain("dummy-access-");
  });

  it("rejects invalid credentials", async () => {
    await expect(
      dummyAuthApi.login({
        email: "demo@imperium.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(AuthApiError);
  });

  it("creates an account with a valid invitation code", async () => {
    const result = await dummyAuthApi.signup({
      firstName: "Sam",
      lastName: "Patel",
      email: "sam@imperium.com",
      invitationCode: "IMPERIUM-2026",
    });

    expect(result.kind).toBe("session");
    if (result.kind === "session") {
      expect(result.session.user.firstName).toBe("Sam");
    }
  });

  it("rejects an unknown invitation code", async () => {
    await expect(
      dummyAuthApi.signup({
        firstName: "Sam",
        lastName: "Patel",
        email: "sam@imperium.com",
        invitationCode: "INVALID",
      }),
    ).rejects.toMatchObject({ code: "INVALID_INVITATION_CODE" });
  });

  it("always succeeds for password reset", async () => {
    const response = await dummyAuthApi.requestPasswordReset({
      email: "unknown@imperium.com",
    });
    expect(response.message).toMatch(/reset/i);
  });

  it("signs in through the dummy Entra flow", async () => {
    const result = await dummyAuthApi.loginWithEntra();
    expect(result.kind).toBe("session");
    if (result.kind === "session") {
      expect(result.session.user.email).toBe("entra.user@imperium.com");
    }
  });
});
