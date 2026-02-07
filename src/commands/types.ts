import type { CommandContext } from "../app/command-context.js";

export interface CommandModule {
  name: string;
  run(args: string[], ctx: CommandContext): Promise<number>;
}
