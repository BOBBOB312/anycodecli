import { describe, it, expect, vi } from "vitest";
import type { ProcessSpawner, SpawnedProcess } from "../src/infra/process/process-spawner.js";
import { LegacyProcessSessionRuntime } from "../src/agents/shared/legacy-process-session-runtime.js";
import { createLegacyRuntimeFactory } from "../src/domain/session/legacy-runtime-factory.js";

class FakeChild implements SpawnedProcess {
  private exitHandler: ((code: number | null, signal: NodeJS.Signals | null) => void) | null = null;
  private errorHandler: ((error: Error) => void) | null = null;
  kill = vi.fn(() => true);

  on(event: "error" | "exit", listener: ((error: Error) => void) | ((code: number | null, signal: NodeJS.Signals | null) => void)): this {
    if (event === "error") {
      this.errorHandler = listener as (error: Error) => void;
    } else {
      this.exitHandler = listener as (code: number | null, signal: NodeJS.Signals | null) => void;
    }
    return this;
  }

  emitExit(): void {
    this.exitHandler?.(0, null);
  }
}

describe("legacy process runtime", () => {
  it("spawns legacy provider process with mode flag", async () => {
    const child = new FakeChild();
    const spawn = vi.fn<ProcessSpawner["spawn"]>(() => child);
    const spawner: ProcessSpawner = { spawn };

    const runtime = new LegacyProcessSessionRuntime({
      provider: "claude",
      mode: "remote",
      passthroughArgs: ["--help"],
      spawner
    });

    const done = runtime.run();
    child.emitExit();
    const reason = await done;

    expect(reason).toBe("exit");
    expect(spawn).toHaveBeenCalledTimes(1);
    const args = spawn.mock.calls[0][1];
    expect(args).toContain("claude");
    expect(args).toContain("--happy-starting-mode");
    expect(args).toContain("remote");
    expect(args).toContain("--help");
  });

  it("factory returns runtime by provider", () => {
    const spawner: ProcessSpawner = {
      spawn: vi.fn(() => new FakeChild())
    };

    const claudeFactory = createLegacyRuntimeFactory("claude", spawner, []);
    const codexFactory = createLegacyRuntimeFactory("codex", spawner, []);
    const geminiFactory = createLegacyRuntimeFactory("gemini", spawner, []);

    expect(claudeFactory.create("local")).toBeDefined();
    expect(codexFactory.create("local")).toBeDefined();
    expect(geminiFactory.create("local")).toBeDefined();
  });
});
