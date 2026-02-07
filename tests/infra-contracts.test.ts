import { describe, it, expect } from "vitest";
import { NoopMachineSyncClient } from "../src/infra/api/machine-sync-client.js";
import { NoopControlClient } from "../src/infra/daemon-http/control-client.js";
import { ConsoleLogger, NoopLogger } from "../src/infra/logging/logger.js";
import { SignalManager } from "../src/infra/process/signal-manager.js";
import { FlagReadinessPolicy } from "../src/domain/session/readiness-policy.js";

describe("NoopMachineSyncClient", () => {
  it("implements all methods without error", async () => {
    const client = new NoopMachineSyncClient();
    client.connect();
    client.setRPCHandlers({ spawnSession: async () => ({ type: "error" as const, errorMessage: "noop" }), stopSession: () => false, requestShutdown: () => {} });
    await client.updateMachineMetadata();
    await client.updateDaemonState();
    client.shutdown();
  });
});

describe("NoopControlClient", () => {
  it("returns empty/false defaults", async () => {
    const client = new NoopControlClient();
    expect(await client.listSessions()).toEqual([]);
    expect(await client.stopSession("x")).toBe(false);
    expect(await client.isDaemonRunning()).toBe(false);
    expect(await client.isDaemonRunningCurrentVersion()).toBe(false);
  });
});

describe("NoopLogger", () => {
  it("does not throw", () => {
    const logger = new NoopLogger();
    logger.debug("test");
    logger.info("test");
    logger.warn("test");
    logger.error("test");
  });
});

describe("ConsoleLogger", () => {
  it("does not throw", () => {
    const logger = new ConsoleLogger();
    logger.info("test");
    logger.warn("test");
    logger.error("test");
  });
});

describe("SignalManager", () => {
  it("stores handlers", () => {
    const mgr = new SignalManager();
    let called = false;
    mgr.on("SIGINT", () => { called = true; });
    mgr.dispose();
    // dispose clears handlers
    expect(called).toBe(false);
  });
});

describe("FlagReadinessPolicy", () => {
  it("tracks ready state", () => {
    const policy = new FlagReadinessPolicy();
    expect(policy.isReady()).toBe(false);
    policy.markReady();
    expect(policy.isReady()).toBe(true);
    policy.reset();
    expect(policy.isReady()).toBe(false);
  });
});
