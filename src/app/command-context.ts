import type { ProcessSpawner } from "../infra/process/process-spawner.js";
import type { SessionSyncClientFactory } from "../infra/api/session-sync-client-factory.js";

export interface CommandRunner {
  runLegacy(args: string[]): Promise<number>;
}

export interface CommandContext {
  runner: CommandRunner;
  spawner: ProcessSpawner;
  sessionSyncFactory: SessionSyncClientFactory;
}
