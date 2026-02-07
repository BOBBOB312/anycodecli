/**
 * Machine sync client contract — mirrors happy-cli's ApiMachineClient.
 * Handles daemon↔server WebSocket communication for machine-scoped state.
 */

import type { MachineMetadata, DaemonState } from "./types.js";

export interface MachineSyncClient {
  connect(): void;
  shutdown(): void;
  updateMachineMetadata(handler: (prev: MachineMetadata | null) => MachineMetadata): Promise<void>;
  updateDaemonState(handler: (prev: DaemonState | null) => DaemonState): Promise<void>;
  setRPCHandlers(handlers: MachineRpcHandlers): void;
}

export interface SpawnSessionOptions {
  directory: string;
  sessionId?: string;
  machineId?: string;
  approvedNewDirectoryCreation?: boolean;
  agent?: string;
  token?: string;
  environmentVariables?: Record<string, string>;
}

export type SpawnSessionResult =
  | { type: "success"; sessionId: string }
  | { type: "requestToApproveDirectoryCreation"; directory: string }
  | { type: "error"; errorMessage: string };

export interface MachineRpcHandlers {
  spawnSession: (options: SpawnSessionOptions) => Promise<SpawnSessionResult>;
  stopSession: (sessionId: string) => boolean;
  requestShutdown: () => void;
}

/**
 * Noop implementation for offline / test scenarios.
 */
export class NoopMachineSyncClient implements MachineSyncClient {
  connect(): void {}
  shutdown(): void {}
  async updateMachineMetadata(_handler?: unknown): Promise<void> {}
  async updateDaemonState(_handler?: unknown): Promise<void> {}
  setRPCHandlers(_handlers?: unknown): void {}
}
