import { describe, it, expect, vi } from "vitest";
import { daemonCommand, parseDaemonArgs } from "../src/commands/daemon/command.js";
import type { CommandContext } from "../src/app/command-context.js";
import type { ProcessSpawner } from "../src/infra/process/process-spawner.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";

const noopSpawner: ProcessSpawner = {
  spawn: vi.fn(() => {
    throw new Error("should not spawn in daemon command tests");
  })
};

function makeCtx(runLegacy = vi.fn(async () => 0)): CommandContext {
  return {
    runner: { runLegacy },
    spawner: noopSpawner,
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

describe("daemon command parser", () => {
  it("parses stop-session", () => {
    const parsed = parseDaemonArgs(["stop-session", "abc"]);
    expect(parsed).toEqual({ type: "stop-session", sessionId: "abc" });
  });

  it("parses spawn-session with optional session-id", () => {
    const parsed = parseDaemonArgs(["spawn-session", "/tmp/a", "--session-id", "s1"]);
    expect(parsed).toEqual({ type: "spawn-session", directory: "/tmp/a", sessionId: "s1" });
  });

  it("falls through unknown args", () => {
    const parsed = parseDaemonArgs(["doctor"]);
    expect(parsed).toEqual({ type: "passthrough", args: ["doctor"] });
  });
});

describe("daemon command execution", () => {
  it("routes start to legacy daemon start", async () => {
    const runLegacy = vi.fn(async () => 0);
    const code = await daemonCommand.run(["start"], makeCtx(runLegacy));
    expect(code).toBe(0);
    expect(runLegacy).toHaveBeenCalledWith(["daemon", "start"]);
  });

  it("routes passthrough to legacy daemon args", async () => {
    const runLegacy = vi.fn(async () => 7);
    const code = await daemonCommand.run(["foo", "bar"], makeCtx(runLegacy));
    expect(code).toBe(7);
    expect(runLegacy).toHaveBeenCalledWith(["daemon", "foo", "bar"]);
  });
});
