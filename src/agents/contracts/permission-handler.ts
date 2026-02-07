/**
 * Permission handler contract — shared across all agent backends.
 * Provider-specific permission logic lives in agents/*, not in domain/.
 */

export type PermissionDecision = "approved" | "approved_for_session" | "denied" | "abort";

export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  payload: unknown;
}

export interface PermissionHandler {
  requestPermission(request: PermissionRequest): Promise<PermissionDecision>;
}
