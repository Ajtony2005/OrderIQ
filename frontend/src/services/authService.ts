import {
  endpoints,
  type AuthUser,
  type GoogleAuthPayload,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "../lib/endpoints";

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  backendRole: "ADMIN" | "USER" | "KITCHEN";
  providers: Array<"PASSWORD" | "GOOGLE">;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthSessionUser;
}

function toSessionUser(user: AuthUser): AuthSessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "staff",
    backendRole: user.role,
    providers: user.providers,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toAuthSession(accessToken: string, user: AuthUser): AuthSession {
  return {
    accessToken,
    user: toSessionUser(user),
  };
}

export function getAccessToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function loginWithPassword(payload: LoginPayload): Promise<AuthSession> {
  const auth = await endpoints.auth.login(payload);
  saveAccessToken(auth.accessToken);
  try {
    const user = await endpoints.auth.me();
    return toAuthSession(auth.accessToken, user);
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function registerWithPassword(payload: RegisterPayload): Promise<AuthSession> {
  const auth = await endpoints.auth.register(payload);
  saveAccessToken(auth.accessToken);
  try {
    const user = await endpoints.auth.me();
    return toAuthSession(auth.accessToken, user);
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function loginWithGoogle(payload: GoogleAuthPayload): Promise<AuthSession> {
  const auth = await endpoints.auth.google(payload);
  saveAccessToken(auth.accessToken);
  try {
    const user = await endpoints.auth.me();
    return toAuthSession(auth.accessToken, user);
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function fetchCurrentUser(): Promise<AuthSessionUser> {
  const user = await endpoints.auth.me();
  return toSessionUser(user);
}

export async function updateCurrentUser(payload: UpdateProfilePayload): Promise<AuthSessionUser> {
  const user = await endpoints.auth.updateMe(payload);
  return toSessionUser(user);
}

export async function logoutCurrentUser(): Promise<void> {
  await endpoints.auth.logout();
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem("auth_token", accessToken);
}

export function clearAccessToken(): void {
  localStorage.removeItem("auth_token");
}
