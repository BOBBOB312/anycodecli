import type { CommandContext } from "./command-context.js";
import type { CommandModule } from "../commands/types.js";
import { rootCommand } from "../commands/root/command.js";
import { claudeCommand } from "../commands/claude/command.js";
import { codexCommand } from "../commands/codex/command.js";
import { geminiCommand } from "../commands/gemini/command.js";
import { daemonCommand } from "../commands/daemon/command.js";
import { authCommand } from "../commands/auth/command.js";
import { connectCommand } from "../commands/connect/command.js";
import { doctorCommand } from "../commands/doctor/command.js";
import { notifyCommand } from "../commands/notify/command.js";

const registry: Record<string, CommandModule> = {
  claude: claudeCommand,
  codex: codexCommand,
  gemini: geminiCommand,
  daemon: daemonCommand,
  auth: authCommand,
  connect: connectCommand,
  doctor: doctorCommand,
  notify: notifyCommand
};

export async function routeAndRun(argv: string[], ctx: CommandContext): Promise<number> {
  const [first, ...rest] = argv;
  if (!first || first.startsWith("-")) {
    return rootCommand.run(argv, ctx);
  }

  const command = registry[first];
  if (!command) {
    return rootCommand.run(argv, ctx);
  }

  return command.run(rest, ctx);
}

export function getRegisteredCommandNames(): string[] {
  return Object.keys(registry).sort();
}
