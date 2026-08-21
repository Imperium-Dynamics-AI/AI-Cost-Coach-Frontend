import { AuthApiError } from "@/features/auth/api/errors";
import {
  DUMMY_ENTRA_USER_ID,
  SEED_USERS,
  VALID_INVITATION_CODES,
  type DummyUserRecord,
} from "@/features/auth/constants/dummyData";
import type {
  AuthApi,
  AuthSession,
  AuthTokens,
  EntraLoginResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  SignupRequest,
  SignupResult,
  User,
} from "@/features/auth/types/auth";

const NETWORK_DELAY_MS = 500;

let users: DummyUserRecord[] = SEED_USERS.map((user) => ({ ...user }));

function wait(ms = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toPublicUser(user: DummyUserRecord): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

function createTokens(userId: string): AuthTokens {
  return {
    accessToken: `dummy-access-${userId}-${Date.now()}`,
    refreshToken: `dummy-refresh-${userId}-${Date.now()}`,
    expiresIn: 60 * 60,
  };
}

function createSession(user: DummyUserRecord): AuthSession {
  return {
    user: toPublicUser(user),
    tokens: createTokens(user.id),
  };
}

function findByEmail(email: string): DummyUserRecord | undefined {
  return users.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

function findByToken(accessToken: string): DummyUserRecord | undefined {
  const match = accessToken.match(/^dummy-access-(.+?)-\d+$/);
  if (!match) {
    return undefined;
  }
  return users.find((user) => user.id === match[1]);
}

export const dummyAuthApi: AuthApi = {
  async login(payload: LoginRequest): Promise<AuthSession> {
    await wait();
    const user = findByEmail(payload.email);

    if (!user || user.password !== payload.password) {
      throw new AuthApiError("Invalid email or password.", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }

    return createSession(user);
  },

  async signup(payload: SignupRequest): Promise<SignupResult> {
    await wait();

    if (
      !VALID_INVITATION_CODES.includes(
        payload.invitationCode.trim() as (typeof VALID_INVITATION_CODES)[number],
      )
    ) {
      throw new AuthApiError("This invitation code is not valid.", {
        status: 400,
        code: "INVALID_INVITATION_CODE",
        fieldErrors: { invitationCode: "Enter a valid invitation code." },
      });
    }

    if (findByEmail(payload.email)) {
      throw new AuthApiError("An account with this email already exists.", {
        status: 409,
        code: "EMAIL_TAKEN",
        fieldErrors: { email: "An account with this email already exists." },
      });
    }

    const user: DummyUserRecord = {
      id: `user-${Date.now()}`,
      email: payload.email.trim().toLowerCase(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      role: "Admin",
      password: "Password123!",
    };

    users = [...users, user];

    return { kind: "session", session: createSession(user) };
  },

  async requestPasswordReset(
    payload: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    await wait();
    findByEmail(payload.email);

    return {
      message: "If that email is registered, a reset link has been sent.",
    };
  },

  async loginWithEntra(): Promise<EntraLoginResult> {
    await wait(700);
    const user = users.find((entry) => entry.id === DUMMY_ENTRA_USER_ID);

    if (!user) {
      throw new AuthApiError("Entra ID sign-in is unavailable.", {
        status: 503,
        code: "ENTRA_UNAVAILABLE",
      });
    }

    return { kind: "session", session: createSession(user) };
  },

  async getCurrentUser(accessToken: string): Promise<User> {
    await wait(150);
    const user = findByToken(accessToken);

    if (!user) {
      throw new AuthApiError("Your session has expired.", {
        status: 401,
        code: "UNAUTHORIZED",
      });
    }

    return toPublicUser(user);
  },

  async logout(): Promise<void> {
    await wait(150);
  },
};

export function resetDummyUsers(): void {
  users = SEED_USERS.map((user) => ({ ...user }));
}
