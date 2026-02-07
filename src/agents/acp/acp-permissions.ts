/**
 * ACP permission pipeline contract.
 * Defines the interface for handling permission requests from ACP agents.
 */

export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  payload: unknown;
}

export type PermissionDecision = "approved" | "denied" | "abort";

export interface PermissionHandler {
  requestPermission(request: PermissionRequest): Promise<PermissionDecision>;
}

/**
 * Auto-approve handler for testing / bypass-permissions mode.
 */
export class AutoApprovePermissionHandler implements PermissionHandler {
  async requestPermission(_request: PermissionRequest): Promise<PermissionDecision> {
    return "approved";
  }
}
