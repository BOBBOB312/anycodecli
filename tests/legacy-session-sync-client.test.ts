import { describe, it, expect } from "vitest";
import { LegacySessionSyncClient } from "../src/infra/api/legacy-session-sync-client.js";

describe("LegacySessionSyncClient", () => {
  it("tracks connectivity and keep-alive state", async () => {
    const client = new LegacySessionSyncClient();
    expect(client.isConnected()).toBe(false);

    await client.connect();
    expect(client.isConnected()).toBe(true);

    client.keepAlive(true, "remote");
    expect(client.getKeepAliveState()).toEqual({ thinking: true, mode: "remote" });

    await client.close();
    expect(client.isConnected()).toBe(false);
  });

  it("dispatches user messages to registered handler", () => {
    const client = new LegacySessionSyncClient();
    const seen: unknown[] = [];
    client.onUserMessage((msg) => seen.push(msg));

    client.emitUserMessage({ role: "user", content: "ping" });
    expect(seen).toEqual([{ role: "user", content: "ping" }]);
  });
});
