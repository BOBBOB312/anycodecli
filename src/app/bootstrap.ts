import { routeAndRun } from "./command-router.js";
import type { CommandContext } from "./command-context.js";
import { createDefaultCommandContext } from "./context-factory.js";

export async function bootstrapWithContext(argv: string[], ctx: CommandContext): Promise<number> {
  return routeAndRun(argv, ctx);
}

export async function bootstrap(argv: string[]): Promise<number> {
  return bootstrapWithContext(argv, createDefaultCommandContext());
}
