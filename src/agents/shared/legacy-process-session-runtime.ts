import type { RuntimeExitReason, SessionRuntime } from "../contracts/session-runtime.js";
import type { SessionMode } from "../../infra/api/session-sync-client.js";
import type { ProcessSpawner, SpawnedProcess } from "../../infra/process/process-spawner.js";
import { resolveLegacyEntryPath } from "../../infra/process/legacy-entry.js";

export interface LegacyProcessSessionRuntimeOptions {
  provider: "claude" | "codex" | "gemini";
  mode: SessionMode;
  passthroughArgs: string[];
  spawner: ProcessSpawner;
}

export class LegacyProcessSessionRuntime implements SessionRuntime {
  private child: SpawnedProcess | null = null;

  constructor(private readonly options: LegacyProcessSessionRuntimeOptions) {}

  async run(): Promise<RuntimeExitReason> {
    const entry = resolveLegacyEntryPath();
    const args = [
      entry,
      this.options.provider,
      "--happy-starting-mode",
      this.options.mode,
      ...this.options.passthroughArgs
    ];

    return new Promise((resolveExit) => {
      this.child = this.options.spawner.spawn(process.execPath, args, {
        stdio: "inherit",
        env: process.env
      });

      this.child.on("error", () => {
        this.child = null;
        resolveExit("exit");
      });

      this.child.on("exit", () => {
        this.child = null;
        resolveExit("exit");
      });
    });
  }

  async abort(): Promise<void> {
    this.child?.kill("SIGINT");
  }

  async kill(): Promise<void> {
    this.child?.kill("SIGKILL");
  }
}
