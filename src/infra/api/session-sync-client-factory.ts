import type { SessionSyncClient } from "./session-sync-client.js";
import { NoopSessionSyncClient } from "./session-sync-client.js";
import { LegacySessionSyncClient } from "./legacy-session-sync-client.js";

const SYNC_MODE_ENV = "ANYCODECLI_SESSION_SYNC_MODE";
type SyncMode = "legacy" | "noop";

function readSyncMode(): SyncMode {
  const raw = process.env[SYNC_MODE_ENV];
  if (raw === "noop") {
    return "noop";
  }
  return "legacy";
}

export interface SessionSyncClientFactory {
  create(): SessionSyncClient;
}

export class NoopSessionSyncClientFactory implements SessionSyncClientFactory {
  create(): SessionSyncClient {
    return new NoopSessionSyncClient();
  }
}

export class ConfigurableSessionSyncClientFactory implements SessionSyncClientFactory {
  constructor(private readonly mode: SyncMode = readSyncMode()) {}

  create(): SessionSyncClient {
    if (this.mode === "noop") {
      return new NoopSessionSyncClient();
    }
    return new LegacySessionSyncClient();
  }
}

export function sessionSyncModeEnvName(): string {
  return SYNC_MODE_ENV;
}
