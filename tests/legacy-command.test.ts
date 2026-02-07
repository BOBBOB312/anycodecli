import { describe, it, expect, vi } from "vitest";
import { LegacySubcommandGateway } from "../src/domain/subcommand/legacy-subcommand-gateway.js";
import { SubcommandOrchestrator } from "../src/domain/subcommand/subcommand-orchestrator.js";
import type { CommandContext } from "../src/app/command-context.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";

function makeCtx(runLegacy = vi.fn(async () => 0)): CommandContext {
  return {
    runner: { runLegacy },
    spawner: {
      spawn: vi.fn(() => {
        throw new Error("spawner not used for legacy command test");
      })
    },
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

describe("LegacySubcommandGateway + SubcommandOrchestrator", () => {
  it("prefixes command name by default", async () => {
    const runLegacy = vi.fn(async () => 0);
    const gateway = new LegacySubcommandGateway(makeCtx(runLegacy).runner, "doctor");
    const orchestrator = new SubcommandOrchestrator(gateway);
    await orchestrator.run(["clean"]);
    expect(runLegacy).toHaveBeenCalledWith(["doctor", "clean"]);
  });

  it("can run without command prefix", async () => {
    const runLegacy = vi.fn(async () => 0);
    const gateway = new LegacySubcommandGateway(makeCtx(runLegacy).runner, "root", false);
    const orchestrator = new SubcommandOrchestrator(gateway);
    await orchestrator.run(["--help"]);
    expect(runLegacy).toHaveBeenCalledWith(["--help"]);
  });
});
