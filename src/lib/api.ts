/**
 * One place that knows where the API lives and how a response is unwrapped.
 *
 * Every protected call sends the JWT from localStorage as a Bearer token —
 * the server re-reads the user's role from the database on each request, so
 * nothing about identity is trusted from this side.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000"
).replace(/\/+$/, "");

const TOKEN_KEY = "pizzahub.token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Set to false for calls that must not send the Bearer token. */
  auth?: boolean;
  /** When set, a 401 clears the stored token and redirects to sign-in. */
  onAuthFailure?: () => void;
}

/** Calls the PizzaHub API and unwraps the `{ success, data }` envelope. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, onAuthFailure, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  const token = auth ? getStoredToken() : null;
  if (token) requestHeaders.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Needed for the Better Auth session cookie used during sign-in.
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && onAuthFailure) {
      storeToken(null);
      onAuthFailure();
    }
    throw new ApiError(
      payload?.message ?? "Something went wrong, please try again",
      response.status,
      payload?.errors,
    );
  }

  return payload.data as T;
}

interface BetterAuthError {
  message?: string;
  code?: string;
}

/**
 * Better Auth endpoints answer with their own shape (`{ user }` / `{ url }`)
 * rather than our envelope, so they get their own thin wrapper.
 */
export async function authRequest<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}/api/auth${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & BetterAuthError)
    | null;

  if (!response.ok) {
    throw new ApiError(
      friendlyAuthMessage(payload?.code, payload?.message),
      response.status,
    );
  }

  return payload as T;
}

function friendlyAuthMessage(code?: string, message?: string): string {
  switch (code) {
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "That email is already registered — try signing in instead";
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Incorrect email or password";
    case "INVALID_EMAIL":
      return "Enter a valid email address";
    case "PASSWORD_TOO_SHORT":
      return "Password must be at least 6 characters";
    case "PASSWORD_TOO_LONG":
      return "That password is too long";
    default:
      return message && message.length > 0
        ? message
        : "Something went wrong, please try again";
  }
}
