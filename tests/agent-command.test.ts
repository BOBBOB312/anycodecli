import { describe, it, expect, vi } from "vitest";
import { createAgentCommand, parseAgentArgs } from "../src/commands/agent/command.js";
import type { CommandContext } from "../src/app/command-context.js";
import type { ProcessSpawner, SpawnedProcess } from "../src/infra/process/process-spawner.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";

class FakeChild implements SpawnedProcess {
  private exitListener: ((code: number | null, signal: NodeJS.Signals | null) => void) | null = null;

  kill(): boolean {
    return true;
  }

  on(event: "error" | "exit", listener: ((error: Error) => void) | ((code: number | null, signal: NodeJS.Signals | null) => void)): this {
    if (event === "exit") {
      this.exitListener = listener as (code: number | null, signal: NodeJS.Signals | null) => void;
      this.exitListener(0, null);
    }
    return this;
  }
}

function makeCtx(spawner: ProcessSpawner): CommandContext {
  return {
    runner: { runLegacy: vi.fn(async () => 0) },
    spawner,
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

describe("agent command args parser", () => {
  it("extracts anycodecli starting mode", () => {
    const parsed = parseAgentArgs(["--anycodecli-starting-mode", "remote", "--help"]);
    expect(parsed.startingMode).toBe("remote");
    expect(parsed.passthroughArgs).toEqual(["--help"]);
  });

  it("extracts legacy starting mode", () => {
    const parsed = parseAgentArgs(["--happy-starting-mode", "local", "--foo"]);
    expect(parsed.startingMode).toBe("local");
    expect(parsed.passthroughArgs).toEqual(["--foo"]);
  });

  it("keeps unknown mode flags in passthrough", () => {
    const parsed = parseAgentArgs(["--anycodecli-starting-mode", "weird", "x"]);
    expect(parsed.startingMode).toBeUndefined();
    expect(parsed.passthroughArgs).toEqual(["--anycodecli-starting-mode", "weird", "x"]);
  });

  it("runs provider through orchestrator runtime path", async () => {
    const spawn = vi.fn<ProcessSpawner["spawn"]>(() => new FakeChild());
    const spawner: ProcessSpawner = { spawn };
    const ctx = makeCtx(spawner);

    const command = createAgentCommand("claude");
    const code = await command.run(["--anycodecli-starting-mode", "remote", "--help"], ctx);

    expect(code).toBe(0);
    expect(spawn).toHaveBeenCalledTimes(1);
    const args = spawn.mock.calls[0][1];
    expect(args).toContain("claude");
    expect(args).toContain("remote");
    expect(args).toContain("--help");
  });
});
