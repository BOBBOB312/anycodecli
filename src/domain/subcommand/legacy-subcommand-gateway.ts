import type { CommandRunner } from "../../app/command-context.js";
import type { SubcommandGateway } from "./types.js";

export class LegacySubcommandGateway implements SubcommandGateway {
  constructor(
    private readonly runner: CommandRunner,
    private readonly subcommand: string,
    private readonly includeName = true
  ) {}

  run(args: string[]): Promise<number> {
    const legacyArgs = this.includeName ? [this.subcommand, ...args] : args;
    return this.runner.runLegacy(legacyArgs);
  }
}
