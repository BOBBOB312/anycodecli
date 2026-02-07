import { describe, it, expect } from "vitest";
import {
  ConfigurableSessionSyncClientFactory,
  NoopSessionSyncClientFactory,
  sessionSyncModeEnvName
} from "../src/infra/api/session-sync-client-factory.js";
import { LegacySessionSyncClient } from "../src/infra/api/legacy-session-sync-client.js";
import { NoopSessionSyncClient } from "../src/infra/api/session-sync-client.js";

describe("session sync client factories", () => {
  it("creates noop sync client from noop factory", () => {
    const factory = new NoopSessionSyncClientFactory();
    const client = factory.create();
    expect(client).toBeInstanceOf(NoopSessionSyncClient);
  });

  it("creates legacy sync client by default", () => {
    const factory = new ConfigurableSessionSyncClientFactory();
    const client = factory.create();
    expect(client).toBeInstanceOf(LegacySessionSyncClient);
  });

  it("respects env mode selection", () => {
    const env = sessionSyncModeEnvName();
    const prev = process.env[env];
    process.env[env] = "noop";

    const factory = new ConfigurableSessionSyncClientFactory();
    const client = factory.create();
    expect(client).toBeInstanceOf(NoopSessionSyncClient);

    if (prev === undefined) {
      delete process.env[env];
    } else {
      process.env[env] = prev;
    }
  });
});
