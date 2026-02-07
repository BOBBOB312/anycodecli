/**
 * Daemon HTTP control server contract.
 * Mirrors happy-cli's controlServer.ts interface.
 * Real Fastify implementation stays in happy-cli during legacy delegation phase.
 */

import type { Metadata } from "../../infra/api/types.js";
import type { SpawnSessionOptions, SpawnSessionResult } from "../../infra/api/machine-sync-client.js";

export interface TrackedSessionInfo {
  startedBy: string;
  happySessionId: string;
  pid: number;
}

export interface ControlServerDeps {
  getChildren(): TrackedSessionInfo[];
  stopSession(sessionId: string): boolean;
  spawnSession(options: SpawnSessionOptions): Promise<SpawnSessionResult>;
  requestShutdown(): void;
  onHappySessionWebhook(sessionId: string, metadata: Metadata): void;
}

export interface ControlServer {
  readonly port: number;
  stop(): Promise<void>;
}

export interface ControlServerFactory {
  start(deps: ControlServerDeps): Promise<ControlServer>;
}
