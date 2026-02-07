import { SessionLifecycle } from "../../domain/session/session-lifecycle.js";
import { SessionOrchestrator } from "../../domain/session/session-orchestrator.js";
import { createLegacyRuntimeFactory, type Provider } from "../../domain/session/legacy-runtime-factory.js";
import type { SessionMode } from "../../infra/api/session-sync-client.js";
import type { CommandContext } from "../../app/command-context.js";
import type { CommandModule } from "../types.js";

interface ParsedAgentArgs {
  passthroughArgs: string[];
  startingMode?: SessionMode;
}

function parseAgentArgs(args: string[]): ParsedAgentArgs {
  const passthroughArgs: string[] = [];
  let startingMode: SessionMode | undefined;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--anycodecli-starting-mode" || arg === "--happy-starting-mode") {
      const next = args[i + 1];
      if (next === "local" || next === "remote") {
        startingMode = next;
        i += 1;
        continue;
      }
    }
    passthroughArgs.push(arg);
  }

  return { passthroughArgs, startingMode };
}

export function createAgentCommand(provider: Provider): CommandModule {
  return {
    name: provider,
    async run(args: string[], ctx: CommandContext): Promise<number> {
      const parsed = parseAgentArgs(args);
      const runtimeFactory = createLegacyRuntimeFactory(provider, ctx.spawner, parsed.passthroughArgs);
      const lifecycle = new SessionLifecycle(ctx.sessionSyncFactory.create(), parsed.startingMode ?? "local");
      const orchestrator = new SessionOrchestrator(runtimeFactory, lifecycle);

      await orchestrator.start({ startingMode: parsed.startingMode ?? "local" });
      return 0;
    }
  };
}

export { parseAgentArgs };
