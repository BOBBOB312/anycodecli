import { describe, it, expect, vi } from "vitest";
import { DaemonOrchestrator } from "../src/domain/daemon/daemon-orchestrator.js";
import type { DaemonGateway } from "../src/domain/daemon/types.js";
import { HeartbeatService } from "../src/domain/daemon/heartbeat-service.js";
import { ChildRegistry } from "../src/domain/daemon/child-registry.js";

function createGateway(overrides?: Partial<DaemonGateway>): DaemonGateway {
  return {
    start: vi.fn(async () => 0),
    stop: vi.fn(async () => 0),
    status: vi.fn(async () => 0),
    list: vi.fn(async () => 0),
    stopSession: vi.fn(async () => 0),
    spawnSession: vi.fn(async () => 0),
    passthrough: vi.fn(async () => 0),
    ...overrides
  };
}

describe("DaemonOrchestrator", () => {
  it("starts heartbeat on successful daemon start and stops on stop", async () => {
    const gateway = createGateway();
    const heartbeat = new HeartbeatService(1000);
    const orchestrator = new DaemonOrchestrator(gateway, { heartbeat });

    await orchestrator.start();
    expect(heartbeat.isRunning()).toBe(true);

    await orchestrator.stop();
    expect(heartbeat.isRunning()).toBe(false);
  });

  it("tracks stop-session and spawn through services", async () => {
    const gateway = createGateway();
    const registry = new ChildRegistry();
    const orchestrator = new DaemonOrchestrator(gateway, { registry, heartbeat: new HeartbeatService(1000) });

    await orchestrator.spawnSession("/tmp/project", "s-1");
    expect(registry.has("s-1")).toBe(true);

    await orchestrator.stopSession("s-1");
    expect(registry.has("s-1")).toBe(false);
  });
});
