import type { User } from "@/features/auth/types/auth";

export type DummyUserRecord = User & {
  password: string;
};

export const VALID_INVITATION_CODES = ["IMPERIUM-2026", "COACH-INVITE"] as const;

export const SEED_USERS: DummyUserRecord[] = [
  {
    id: "user-demo-001",
    email: "demo@imperium.com",
    firstName: "Alex",
    lastName: "Morgan",
    role: "Admin",
    password: "Password123!",
  },
  {
    id: "user-entra-001",
    email: "entra.user@imperium.com",
    firstName: "Jordan",
    lastName: "Lee",
    role: "Admin",
    password: "",
  },
];

export const DUMMY_ENTRA_USER_ID = "user-entra-001";
