import type { SessionMode, SessionSyncClient } from "../../infra/api/session-sync-client.js";

export class SessionLifecycle {
  private thinking = false;
  private mode: SessionMode;
  private keepAliveTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly sync: SessionSyncClient,
    initialMode: SessionMode,
    private readonly keepAliveMs = 2000
  ) {
    this.mode = initialMode;
  }

  async start(): Promise<void> {
    await this.sync.connect();
    this.sync.keepAlive(this.thinking, this.mode);
    this.keepAliveTimer = setInterval(() => {
      this.sync.keepAlive(this.thinking, this.mode);
    }, this.keepAliveMs);
  }

  onThinkingChange(thinking: boolean): void {
    this.thinking = thinking;
    this.sync.keepAlive(this.thinking, this.mode);
  }

  onModeChange(mode: SessionMode): void {
    this.mode = mode;
    this.sync.keepAlive(this.thinking, this.mode);
    this.sync.sendSessionEvent({ type: "switch", mode });
  }

  async stop(): Promise<void> {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    await this.sync.flush();
    await this.sync.close();
  }
}
