import { describe, it, expect, vi } from "vitest";
import { authCommand } from "../src/commands/auth/command.js";
import { connectCommand } from "../src/commands/connect/command.js";
import { doctorCommand } from "../src/commands/doctor/command.js";
import { notifyCommand } from "../src/commands/notify/command.js";
import { rootCommand } from "../src/commands/root/command.js";
import type { CommandContext } from "../src/app/command-context.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";

function makeCtx(runLegacy = vi.fn(async () => 0)): CommandContext {
  return {
    runner: { runLegacy },
    spawner: {
      spawn: vi.fn(() => {
        throw new Error("spawner not used for subcommand command tests");
      })
    },
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

describe("subcommand command modules", () => {
  it("auth command routes through auth subcommand", async () => {
    const runLegacy = vi.fn(async () => 0);
    await authCommand.run(["login"], makeCtx(runLegacy));
    expect(runLegacy).toHaveBeenCalledWith(["auth", "login"]);
  });

  it("connect command routes through connect subcommand", async () => {
    const runLegacy = vi.fn(async () => 0);
    await connectCommand.run(["gemini"], makeCtx(runLegacy));
    expect(runLegacy).toHaveBeenCalledWith(["connect", "gemini"]);
  });

  it("doctor command routes through doctor subcommand", async () => {
    const runLegacy = vi.fn(async () => 0);
    await doctorCommand.run(["clean"], makeCtx(runLegacy));
    expect(runLegacy).toHaveBeenCalledWith(["doctor", "clean"]);
  });

  it("notify command routes through notify subcommand", async () => {
    const runLegacy = vi.fn(async () => 0);
    await notifyCommand.run(["status"], makeCtx(runLegacy));
    expect(runLegacy).toHaveBeenCalledWith(["notify", "status"]);
  });

  it("root command passes args without prefix", async () => {
    const runLegacy = vi.fn(async () => 0);
    await rootCommand.run(["--help"], makeCtx(runLegacy));
    expect(runLegacy).toHaveBeenCalledWith(["--help"]);
  });
});
