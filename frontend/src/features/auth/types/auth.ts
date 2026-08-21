export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthSession = {
  user: User;
  tokens: AuthTokens;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  firstName: string;
  lastName: string;
  email: string;
  invitationCode: string;
};

export type SignupResult =
  | { kind: "session"; session: AuthSession }
  | { kind: "pending"; message: string };

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type EntraLoginResult =
  | { kind: "session"; session: AuthSession }
  | { kind: "redirect"; url: string };

export type FieldErrors = Partial<Record<string, string>>;

export type AuthApi = {
  login: (payload: LoginRequest) => Promise<AuthSession>;
  signup: (payload: SignupRequest) => Promise<SignupResult>;
  requestPasswordReset: (
    payload: ForgotPasswordRequest,
  ) => Promise<ForgotPasswordResponse>;
  loginWithEntra: () => Promise<EntraLoginResult>;
  getCurrentUser: (accessToken: string) => Promise<User>;
  logout: (accessToken: string) => Promise<void>;
};

export type AuthTab = "signin" | "signup";
