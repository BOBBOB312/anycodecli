import type { CommandModule } from "../types.js";
import type { CommandContext } from "../../app/command-context.js";
import { DaemonOrchestrator } from "../../domain/daemon/daemon-orchestrator.js";
import { LegacyDaemonGateway } from "../../domain/daemon/legacy-daemon-gateway.js";

type ParsedDaemonCommand =
  | { type: "start" }
  | { type: "stop" }
  | { type: "status" }
  | { type: "list" }
  | { type: "stop-session"; sessionId: string }
  | { type: "spawn-session"; directory: string; sessionId?: string }
  | { type: "passthrough"; args: string[] };

export function parseDaemonArgs(args: string[]): ParsedDaemonCommand {
  const [sub, ...rest] = args;
  switch (sub) {
    case "start":
      return { type: "start" };
    case "stop":
      return { type: "stop" };
    case "status":
      return { type: "status" };
    case "list":
      return { type: "list" };
    case "stop-session": {
      const sessionId = rest[0];
      if (!sessionId) {
        return { type: "passthrough", args };
      }
      return { type: "stop-session", sessionId };
    }
    case "spawn-session": {
      const directory = rest[0];
      if (!directory) {
        return { type: "passthrough", args };
      }
      let sessionId: string | undefined;
      for (let i = 1; i < rest.length; i += 1) {
        if (rest[i] === "--session-id" && rest[i + 1]) {
          sessionId = rest[i + 1];
          i += 1;
        }
      }
      return { type: "spawn-session", directory, sessionId };
    }
    default:
      return { type: "passthrough", args };
  }
}

export const daemonCommand: CommandModule = {
  name: "daemon",
  async run(args: string[], ctx: CommandContext): Promise<number> {
    const parsed = parseDaemonArgs(args);
    const orchestrator = new DaemonOrchestrator(new LegacyDaemonGateway(ctx.runner));

    switch (parsed.type) {
      case "start":
        return orchestrator.start();
      case "stop":
        return orchestrator.stop();
      case "status":
        return orchestrator.status();
      case "list":
        return orchestrator.list();
      case "stop-session":
        return orchestrator.stopSession(parsed.sessionId);
      case "spawn-session":
        return orchestrator.spawnSession(parsed.directory, parsed.sessionId);
      case "passthrough":
        return orchestrator.passthrough(parsed.args);
    }
  }
};
