import type {
  AgentState,
  SessionMetadata,
  SessionMode,
  SessionSyncClient,
  UserMessage
} from "./session-sync-client.js";

export class LegacySessionSyncClient implements SessionSyncClient {
  private metadata: SessionMetadata = {};
  private state: AgentState = {};
  private userMessageHandler: ((msg: UserMessage) => void) | null = null;
  private connected = false;
  private keepAliveState: { thinking: boolean; mode: SessionMode } | null = null;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async close(): Promise<void> {
    this.connected = false;
  }

  async flush(): Promise<void> {
    return;
  }

  keepAlive(thinking: boolean, mode: SessionMode): void {
    this.keepAliveState = { thinking, mode };
  }

  sendSessionEvent(): void {
    return;
  }

  async updateMetadata(handler: (prev: SessionMetadata) => SessionMetadata): Promise<void> {
    this.metadata = handler(this.metadata);
  }

  async updateAgentState(handler: (prev: AgentState) => AgentState): Promise<void> {
    this.state = handler(this.state);
  }

  onUserMessage(handler: (msg: UserMessage) => void): void {
    this.userMessageHandler = handler;
  }

  isConnected(): boolean {
    return this.connected;
  }

  emitUserMessage(msg: UserMessage): void {
    this.userMessageHandler?.(msg);
  }

  getKeepAliveState(): { thinking: boolean; mode: SessionMode } | null {
    return this.keepAliveState;
  }
}
