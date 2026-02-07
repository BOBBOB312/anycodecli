import type { RuntimeFactory, SessionRuntime } from "../contracts/session-runtime.js";
import type { SessionMode } from "../../infra/api/session-sync-client.js";
import type { ProcessSpawner } from "../../infra/process/process-spawner.js";
import { LegacyProcessSessionRuntime } from "../shared/legacy-process-session-runtime.js";

export class CodexRuntimeFactory implements RuntimeFactory {
  constructor(
    private readonly spawner: ProcessSpawner,
    private readonly passthroughArgs: string[] = []
  ) {}

  create(mode: SessionMode): SessionRuntime {
    return new LegacyProcessSessionRuntime({
      provider: "codex",
      mode,
      passthroughArgs: this.passthroughArgs,
      spawner: this.spawner
    });
  }
}
