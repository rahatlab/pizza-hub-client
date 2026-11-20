export type ErrorCodes =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "INTERNAL_SERVER_ERROR";

export type Role = "customer" | "vendor" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}
