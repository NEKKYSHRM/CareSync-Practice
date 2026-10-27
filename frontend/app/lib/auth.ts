
import { ApiError, apiRequest } from "./api";
import type {
  LoginCredentials,
  TokenResponse,
  User,
} from "../types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function login(
  credentials: LoginCredentials,
): Promise<{ user: User; accessToken: string }> {
  const formData = new URLSearchParams();

  // FastAPI OAuth2PasswordRequestForm expects "username", not "email".
  formData.set("username", credentials.email);
  formData.set("password", credentials.password);

  const tokenResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!tokenResponse.ok) {
    let message = "Unable to log in. Please check your credentials.";

    try {
      const data: unknown = await tokenResponse.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string"
      ) {
        message = data.detail;
      }
    } catch {
      // Use the default login error message.
    }

    throw new ApiError(message, tokenResponse.status);
  }

  const tokenData = (await tokenResponse.json()) as TokenResponse;

  const user = await getCurrentUser(tokenData.access_token);

  return {
    user,
    accessToken: tokenData.access_token,
  };
}

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

export function logout(): void {
  // The current backend has no server-side logout or refresh-token endpoint.
  // Clear the in-memory session through the Zustand store.
}
