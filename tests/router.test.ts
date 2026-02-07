import { describe, it, expect, vi } from "vitest";
import { routeAndRun, getRegisteredCommandNames } from "../src/app/command-router.js";
import type { CommandContext } from "../src/app/command-context.js";
import type { ProcessSpawner } from "../src/infra/process/process-spawner.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";

const noopSpawner: ProcessSpawner = {
  spawn: vi.fn(() => {
    throw new Error("spawner should not be used in router-only tests");
  })
};

function makeCtx(): CommandContext {
  return {
    runner: {
      runLegacy: vi.fn(async () => 0)
    },
    spawner: noopSpawner,
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

describe("command-router", () => {
  it("routes known subcommand with prefixed name", async () => {
    const ctx = makeCtx();
    const code = await routeAndRun(["daemon", "status"], ctx);

    expect(code).toBe(0);
    expect(ctx.runner.runLegacy).toHaveBeenCalledWith(["daemon", "status"]);
  });

  it("falls back to root command for flags", async () => {
    const ctx = makeCtx();
    await routeAndRun(["--help"], ctx);
    expect(ctx.runner.runLegacy).toHaveBeenCalledWith(["--help"]);
  });

  it("falls back to root command for unknown command", async () => {
    const ctx = makeCtx();
    await routeAndRun(["unknown", "x"], ctx);
    expect(ctx.runner.runLegacy).toHaveBeenCalledWith(["unknown", "x"]);
  });

  it("exports expected command registry", () => {
    const names = getRegisteredCommandNames();
    expect(names).toEqual(["auth", "claude", "codex", "connect", "daemon", "doctor", "gemini", "notify"]);
  });
});
