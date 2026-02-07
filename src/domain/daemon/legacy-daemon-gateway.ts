import type { CommandRunner } from "../../app/command-context.js";
import type { DaemonGateway, SpawnSessionInput } from "./types.js";

export class LegacyDaemonGateway implements DaemonGateway {
  constructor(private readonly runner: CommandRunner) {}

  start(): Promise<number> {
    return this.runner.runLegacy(["daemon", "start"]);
  }

  stop(): Promise<number> {
    return this.runner.runLegacy(["daemon", "stop"]);
  }

  status(): Promise<number> {
    return this.runner.runLegacy(["daemon", "status"]);
  }

  list(): Promise<number> {
    return this.runner.runLegacy(["daemon", "list"]);
  }

  stopSession(sessionId: string): Promise<number> {
    return this.runner.runLegacy(["daemon", "stop-session", sessionId]);
  }

  spawnSession(input: SpawnSessionInput): Promise<number> {
    const args = ["daemon", "spawn-session", input.directory];
    if (input.sessionId) {
      args.push("--session-id", input.sessionId);
    }
    return this.runner.runLegacy(args);
  }

  passthrough(args: string[]): Promise<number> {
    return this.runner.runLegacy(["daemon", ...args]);
  }
}
