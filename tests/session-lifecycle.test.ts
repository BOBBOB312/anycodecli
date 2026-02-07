import { describe, it, expect, vi } from "vitest";
import { SessionLifecycle } from "../src/domain/session/session-lifecycle.js";
import type { SessionSyncClient } from "../src/infra/api/session-sync-client.js";

function createSyncMock(): SessionSyncClient {
  return {
    connect: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    flush: vi.fn(async () => {}),
    keepAlive: vi.fn(() => {}),
    sendSessionEvent: vi.fn(() => {}),
    updateMetadata: vi.fn(async () => {}),
    updateAgentState: vi.fn(async () => {}),
    onUserMessage: vi.fn(() => {})
  };
}

describe("SessionLifecycle", () => {
  it("sends keep alive and switch event", async () => {
    const sync = createSyncMock();
    const lifecycle = new SessionLifecycle(sync, "local", 50);

    await lifecycle.start();
    lifecycle.onModeChange("remote");
    lifecycle.onThinkingChange(true);
    await lifecycle.stop();

    expect(sync.connect).toHaveBeenCalledTimes(1);
    expect(sync.keepAlive).toHaveBeenCalled();
    expect(sync.sendSessionEvent).toHaveBeenCalledWith({ type: "switch", mode: "remote" });
    expect(sync.flush).toHaveBeenCalledTimes(1);
    expect(sync.close).toHaveBeenCalledTimes(1);
  });
});
