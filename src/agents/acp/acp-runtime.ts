/**
 * ACP runtime — legacy delegation to happy-cli's AcpBackend.
 * Defines the contract for ACP-based agent sessions (Gemini, Codex via ACP).
 * Real implementation lives in happy-cli; this is the interface boundary.
 */

import type { RuntimeFactory, SessionRuntime } from "../contracts/session-runtime.js";
import type { SessionMode } from "../../infra/api/session-sync-client.js";
import type { ProcessSpawner } from "../../infra/process/process-spawner.js";
import { LegacyProcessSessionRuntime } from "../shared/legacy-process-session-runtime.js";

export interface AcpRuntimeOptions {
  provider: "gemini" | "codex";
  mode: SessionMode;
  passthroughArgs: string[];
  spawner: ProcessSpawner;
}

/**
 * Factory that creates ACP-based session runtimes.
 * Currently delegates to LegacyProcessSessionRuntime (same as other providers).
 * Will be replaced with native ACP SDK integration in a future phase.
 */
export class AcpRuntimeFactory implements RuntimeFactory {
  constructor(
    private readonly provider: "gemini" | "codex",
    private readonly spawner: ProcessSpawner,
    private readonly passthroughArgs: string[] = []
  ) {}

  create(mode: SessionMode): SessionRuntime {
    return new LegacyProcessSessionRuntime({
      provider: this.provider,
      mode,
      passthroughArgs: this.passthroughArgs,
      spawner: this.spawner
    });
  }
}
