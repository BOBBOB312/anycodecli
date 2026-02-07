import type { SessionMode } from "../../infra/api/session-sync-client.js";

export type RuntimeExitReason = "exit" | "switch-mode";

export interface SessionRuntime {
  run(): Promise<RuntimeExitReason>;
  abort(reason?: string): Promise<void>;
  kill(reason: string): Promise<void>;
}

export interface RuntimeFactory {
  create(mode: SessionMode): SessionRuntime;
}
