import { type ErrorCodes } from "@/types/api";

const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000")
    : "http://localhost:5000";

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodes | undefined;

  constructor(message: string, code: ErrorCodes | undefined, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("pizzahub_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  input: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${input}`, {
    ...init,
    headers,
    credentials: "include",
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok || !data.success) {
    const code = data.error?.code as ErrorCodes | undefined;
    const message = data.message || `Request failed (${res.status})`;

    // Unauthorized → clear token + redirect to sign-in
    if (code === "UNAUTHORIZED" || res.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("pizzahub_token");
        window.localStorage.removeItem("pizzahub_user");
        window.location.href = "/sign-in";
      }
    }

    throw new ApiClientError(message, code, res.status);
  }

  return data.data as T;
}

export const api = {
  get: <T = unknown>(input: string, init?: RequestInit) =>
    apiFetch<T>(input, { ...init, method: "GET" }),
  post: <T = unknown>(input: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(input, {
      ...init,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = unknown>(input: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(input, {
      ...init,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = unknown>(input: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(input, {
      ...init,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = unknown>(input: string, init?: RequestInit) =>
    apiFetch<T>(input, { ...init, method: "DELETE" }),
};
