import { spawn } from "node:child_process";
import type { CommandRunner } from "../../app/command-context.js";
import { resolveLegacyEntryPath } from "./legacy-entry.js";

export class LegacyRunner implements CommandRunner {
  async runLegacy(args: string[]): Promise<number> {
    const entry = resolveLegacyEntryPath();

    return new Promise((resolveExit) => {
      const child = spawn(process.execPath, [entry, ...args], {
        stdio: "inherit",
        env: process.env
      });

      child.on("error", () => {
        resolveExit(1);
      });

      child.on("exit", (code, signal) => {
        if (signal) {
          process.kill(process.pid, signal);
          return;
        }
        resolveExit(code ?? 1);
      });
    });
  }
}
