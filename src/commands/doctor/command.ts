import type { CommandModule } from "../types.js";
import type { CommandContext } from "../../app/command-context.js";
import { LegacySubcommandGateway } from "../../domain/subcommand/legacy-subcommand-gateway.js";
import { SubcommandOrchestrator } from "../../domain/subcommand/subcommand-orchestrator.js";

export const doctorCommand: CommandModule = {
  name: "doctor",
  run(args: string[], ctx: CommandContext): Promise<number> {
    const orchestrator = new SubcommandOrchestrator(new LegacySubcommandGateway(ctx.runner, "doctor"));
    return orchestrator.run(args);
  }
};
