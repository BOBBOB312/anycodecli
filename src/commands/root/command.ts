import type { CommandModule } from "../types.js";
import type { CommandContext } from "../../app/command-context.js";
import { LegacySubcommandGateway } from "../../domain/subcommand/legacy-subcommand-gateway.js";
import { SubcommandOrchestrator } from "../../domain/subcommand/subcommand-orchestrator.js";

export const rootCommand: CommandModule = {
  name: "root",
  run(args: string[], ctx: CommandContext): Promise<number> {
    const orchestrator = new SubcommandOrchestrator(new LegacySubcommandGateway(ctx.runner, "root", false));
    return orchestrator.run(args);
  }
};
