import type { CommandModule } from "../types.js";
import type { CommandContext } from "../../app/command-context.js";
import { LegacySubcommandGateway } from "../../domain/subcommand/legacy-subcommand-gateway.js";
import { SubcommandOrchestrator } from "../../domain/subcommand/subcommand-orchestrator.js";

export const connectCommand: CommandModule = {
  name: "connect",
  run(args: string[], ctx: CommandContext): Promise<number> {
    const orchestrator = new SubcommandOrchestrator(new LegacySubcommandGateway(ctx.runner, "connect"));
    return orchestrator.run(args);
  }
};
