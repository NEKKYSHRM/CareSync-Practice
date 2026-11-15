
import { API_CONFIG } from "./config";
import { ApiError, apiRequest } from "./api";
import type {
  LoginCredentials,
  TokenResponse,
  User,
} from "../types/auth";

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

/**
 * Shared promise to prevent concurrent refresh requests.
 * Multiple callers reuse the same in-flight refresh operation.
 */
let restoreSessionPromise: Promise<AuthSession> | null = null;

/**
 * Register a new practice user.
 * Backend: POST /auth/register
 */
export async function register(
  credentials: RegisterCredentials,
): Promise<User> {
  return apiRequest<User>("/auth/register", {
    method: "POST",
    body: {
      full_name: credentials.full_name,
      email: credentials.email,
      password: credentials.password,
    },
  });
}

/**
 * Authenticate a user using FastAPI's OAuth2 password form.
 * The backend sets the refresh token in an HttpOnly cookie.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const formData = new URLSearchParams();

  formData.set("username", credentials.email);
  formData.set("password", credentials.password);

  const tokenResponse = await fetch(
    `${API_CONFIG.BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      credentials: "include",
    },
  );

  if (!tokenResponse.ok) {
    const message = await getErrorMessage(
      tokenResponse,
      "Unable to log in. Please check your credentials.",
    );

    throw new ApiError(message, tokenResponse.status);
  }

  const tokenData = (await tokenResponse.json()) as TokenResponse;

  if (!tokenData.access_token) {
    throw new Error("The login endpoint did not return an access token.");
  }

  const user = await getCurrentUser(tokenData.access_token);

  return {
    user,
    accessToken: tokenData.access_token,
  };
}

/**
 * Restore an existing session after a page reload.
 *
 * Sends the HttpOnly refresh-token cookie to the backend.
 * The backend returns a new access token, then the current user is fetched.
 *
 * Backend:
 * POST /auth/refresh
 * GET  /auth/me
 */
export function restoreSession(): Promise<AuthSession> {
  if (restoreSessionPromise) {
    return restoreSessionPromise;
  }

  restoreSessionPromise = performRestoreSession().finally(() => {
    restoreSessionPromise = null;
  });

  return restoreSessionPromise;
}

async function performRestoreSession(): Promise<AuthSession> {
  const tokenResponse = await fetch(
    `${API_CONFIG.BASE_URL}/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!tokenResponse.ok) {
    const message = await getErrorMessage(
      tokenResponse,
      "Unable to restore the session.",
    );

    throw new ApiError(message, tokenResponse.status);
  }

  const tokenData = (await tokenResponse.json()) as TokenResponse;

  if (!tokenData.access_token) {
    throw new Error(
      "The refresh endpoint did not return an access token.",
    );
  }

  const user = await getCurrentUser(tokenData.access_token);

  return {
    user,
    accessToken: tokenData.access_token,
  };
}

/**
 * Retrieve the currently authenticated user's profile.
 */
export async function getCurrentUser(
  accessToken: string,
): Promise<User> {
  return apiRequest<User>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}

/**
 * Extract an API error message safely.
 */
async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      return data.detail;
    }
  } catch {
    // Use the fallback when the response has no readable JSON body.
  }

  return fallback;
}

/**
 * Clear the in-memory session through the Zustand store.
 * Server-side session revocation will be connected to logout later.
 */
export function logout(): void {
  // Call Zustand's logout action from the UI layer.
}
