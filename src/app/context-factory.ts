import type { CommandContext } from "./command-context.js";
import { LegacyRunner } from "../infra/process/legacy-runner.js";
import { NodeProcessSpawner } from "../infra/process/process-spawner.js";
import { ConfigurableSessionSyncClientFactory } from "../infra/api/session-sync-client-factory.js";

export function createDefaultCommandContext(): CommandContext {
  return {
    runner: new LegacyRunner(),
    spawner: new NodeProcessSpawner(),
    sessionSyncFactory: new ConfigurableSessionSyncClientFactory()
  };
}
