/**
 * Integration tests — verify cross-module interactions work correctly
 * end-to-end within the anycodecli process boundary.
 */
import { describe, it, expect, vi } from "vitest";
import { bootstrapWithContext } from "../src/app/bootstrap.js";
import type { CommandContext, CommandRunner } from "../src/app/command-context.js";
import type { ProcessSpawner, SpawnedProcess } from "../src/infra/process/process-spawner.js";
import { NoopSessionSyncClientFactory } from "../src/infra/api/session-sync-client-factory.js";
import { SessionOrchestrator } from "../src/domain/session/session-orchestrator.js";
import { SessionLifecycle } from "../src/domain/session/session-lifecycle.js";
import { NoopSessionSyncClient } from "../src/infra/api/session-sync-client.js";
import { DaemonOrchestrator } from "../src/domain/daemon/daemon-orchestrator.js";
import { ChildRegistry } from "../src/domain/daemon/child-registry.js";
import { HeartbeatService } from "../src/domain/daemon/heartbeat-service.js";
import type { DaemonGateway } from "../src/domain/daemon/types.js";
import { MessagePipeline } from "../src/domain/session/message-pipeline.js";

// ── Helper: fake child process that exits immediately ──

class ImmediateExitChild implements SpawnedProcess {
  kill(): boolean { return true; }
  on(event: "error", listener: (error: Error) => void): this;
  on(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    if (event === "exit") (listener as (code: number | null, signal: null) => void)(0, null);
    return this;
  }
}

function makeCtx(opts?: { runLegacy?: CommandRunner["runLegacy"]; spawn?: ProcessSpawner["spawn"] }): CommandContext {
  return {
    runner: { runLegacy: opts?.runLegacy ?? vi.fn(async () => 0) },
    spawner: { spawn: opts?.spawn ?? vi.fn(() => new ImmediateExitChild()) },
    sessionSyncFactory: new NoopSessionSyncClientFactory()
  };
}

// ── Bootstrap → Router → Command integration ──

describe("integration: bootstrap → command routing", () => {
  it("routes auth through full bootstrap chain", async () => {
    const runLegacy = vi.fn(async () => 0);
    const code = await bootstrapWithContext(["auth", "login", "--force"], makeCtx({ runLegacy }));
    expect(code).toBe(0);
    expect(runLegacy).toHaveBeenCalledWith(["auth", "login", "--force"]);
  });

  it("routes agent command through orchestrator → runtime", async () => {
    const spawn = vi.fn<ProcessSpawner["spawn"]>(() => new ImmediateExitChild());
    const code = await bootstrapWithContext(["claude", "--resume"], makeCtx({ spawn }));
    expect(code).toBe(0);
    expect(spawn).toHaveBeenCalledTimes(1);
    const args = spawn.mock.calls[0][1];
    expect(args).toContain("claude");
    expect(args).toContain("--resume");
  });

  it("routes daemon stop through orchestrator → gateway", async () => {
    const runLegacy = vi.fn(async () => 0);
    const code = await bootstrapWithContext(["daemon", "stop"], makeCtx({ runLegacy }));
    expect(code).toBe(0);
    expect(runLegacy).toHaveBeenCalledWith(["daemon", "stop"]);
  });

  it("propagates non-zero exit from legacy runner", async () => {
    const runLegacy = vi.fn(async () => 3);
    const code = await bootstrapWithContext(["doctor"], makeCtx({ runLegacy }));
    expect(code).toBe(3);
  });
});

// ── Session orchestrator + lifecycle integration ──

describe("integration: session orchestrator + lifecycle", () => {
  it("full lifecycle: start → run → mode switch → run → exit → stop", async () => {
    const events: string[] = [];
    let callCount = 0;

    const factory = {
      create(mode: string) {
        return {
          async run() {
            events.push(`run:${mode}`);
            callCount++;
            return callCount === 1 ? "switch-mode" as const : "exit" as const;
          },
          async abort() { events.push("abort"); },
          async kill() { events.push("kill"); }
        };
      }
    };

    const sync = new NoopSessionSyncClient();
    const lifecycle = new SessionLifecycle(sync, "local", 60000);
    const orchestrator = new SessionOrchestrator(factory, lifecycle);

    await orchestrator.start({ startingMode: "local" });

    expect(events).toEqual(["run:local", "run:remote"]);
  });

  it("single run exits cleanly without mode switch", async () => {
    const factory = {
      create() {
        return {
          async run() { return "exit" as const; },
          async abort() {},
          async kill() {}
        };
      }
    };

    const sync = new NoopSessionSyncClient();
    const lifecycle = new SessionLifecycle(sync, "remote", 60000);
    const orchestrator = new SessionOrchestrator(factory, lifecycle);

    await orchestrator.start({ startingMode: "remote" });
    // No error = success
  });
});

// ── Daemon orchestrator + services integration ──

describe("integration: daemon orchestrator + child registry + spawn service", () => {
  it("spawn → list → stop-session → list lifecycle", async () => {
    const gateway: DaemonGateway = {
      start: vi.fn(async () => 0),
      stop: vi.fn(async () => 0),
      status: vi.fn(async () => 0),
      list: vi.fn(async () => 0),
      stopSession: vi.fn(async () => 0),
      spawnSession: vi.fn(async () => 0),
      passthrough: vi.fn(async () => 0)
    };

    const registry = new ChildRegistry();
    const heartbeat = new HeartbeatService(60000);
    const orchestrator = new DaemonOrchestrator(gateway, { registry, heartbeat });

    await orchestrator.start();
    expect(heartbeat.isRunning()).toBe(true);

    // Spawn two sessions
    await orchestrator.spawnSession("/proj/a", "s-1");
    await orchestrator.spawnSession("/proj/b", "s-2");
    expect(registry.list()).toHaveLength(2);

    // Stop one
    await orchestrator.stopSession("s-1");
    expect(registry.has("s-1")).toBe(false);
    expect(registry.has("s-2")).toBe(true);

    // Full stop clears all
    await orchestrator.stop();
    expect(registry.list()).toHaveLength(0);
    expect(heartbeat.isRunning()).toBe(false);
  });
});

// ── MessagePipeline integration ──

describe("integration: message pipeline async flow", () => {
  it("producer-consumer pattern with wait", async () => {
    const pipeline = new MessagePipeline<string>((m) => m);
    const results: string[] = [];

    // Consumer waits
    const consumer = (async () => {
      while (true) {
        const batch = await pipeline.waitForMessagesAndGetAsString();
        if (!batch) break;
        results.push(batch.message);
      }
    })();

    // Producer pushes then closes
    pipeline.push("msg1", "local");
    pipeline.push("msg2", "local");
    // Let consumer drain
    await new Promise(r => setTimeout(r, 10));
    pipeline.push("msg3", "remote");
    await new Promise(r => setTimeout(r, 10));
    pipeline.close();

    await consumer;

    expect(results).toEqual(["msg1\nmsg2", "msg3"]);
  });

  it("isolate-and-clear discards pending messages", async () => {
    const pipeline = new MessagePipeline<string>((m) => m);

    pipeline.push("old1", "a");
    pipeline.push("old2", "a");
    pipeline.pushIsolateAndClear("urgent", "b");

    const batch = await pipeline.waitForMessagesAndGetAsString();
    expect(batch?.message).toBe("urgent");
    expect(batch?.isolate).toBe(true);

    // Queue should be empty after isolated message
    pipeline.close();
    const next = await pipeline.waitForMessagesAndGetAsString();
    expect(next).toBeNull();
  });
});
