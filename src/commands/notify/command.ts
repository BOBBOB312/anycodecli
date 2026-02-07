import type { CommandModule } from "../types.js";
import type { CommandContext } from "../../app/command-context.js";
import { LegacySubcommandGateway } from "../../domain/subcommand/legacy-subcommand-gateway.js";
import { SubcommandOrchestrator } from "../../domain/subcommand/subcommand-orchestrator.js";

export const notifyCommand: CommandModule = {
  name: "notify",
  run(args: string[], ctx: CommandContext): Promise<number> {
    const orchestrator = new SubcommandOrchestrator(new LegacySubcommandGateway(ctx.runner, "notify"));
    return orchestrator.run(args);
  }
};
