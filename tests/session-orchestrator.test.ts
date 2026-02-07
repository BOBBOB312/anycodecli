import { describe, it, expect, vi } from "vitest";
import { SessionOrchestrator } from "../src/domain/session/session-orchestrator.js";
import type { RuntimeFactory, SessionRuntime } from "../src/agents/contracts/session-runtime.js";
import { SessionLifecycle } from "../src/domain/session/session-lifecycle.js";
import { NoopSessionSyncClient } from "../src/infra/api/session-sync-client.js";

describe("SessionOrchestrator", () => {
  it("switches mode on switch-mode and exits on exit", async () => {
    const runCalls: string[] = [];

    const runtimeFactory: RuntimeFactory = {
      create(mode) {
        const runtime: SessionRuntime = {
          async run() {
            runCalls.push(mode);
            return runCalls.length === 1 ? "switch-mode" : "exit";
          },
          async abort() {},
          async kill() {}
        };
        return runtime;
      }
    };

    const lifecycle = new SessionLifecycle(new NoopSessionSyncClient(), "local", 1000);
    const stopSpy = vi.spyOn(lifecycle, "stop");

    const orchestrator = new SessionOrchestrator(runtimeFactory, lifecycle);
    await orchestrator.start({ startingMode: "local" });

    expect(runCalls).toEqual(["local", "remote"]);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });
});
