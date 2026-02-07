export type SessionMode = "local" | "remote";

export interface SessionMetadata {
  [key: string]: unknown;
}

export interface AgentState {
  [key: string]: unknown;
}

export interface UserMessage {
  [key: string]: unknown;
}

export interface SessionSyncClient {
  connect(): Promise<void>;
  close(): Promise<void>;
  flush(): Promise<void>;
  keepAlive(thinking: boolean, mode: SessionMode): void;
  sendSessionEvent(event: unknown): void;
  updateMetadata(handler: (prev: SessionMetadata) => SessionMetadata): Promise<void>;
  updateAgentState(handler: (prev: AgentState) => AgentState): Promise<void>;
  onUserMessage(handler: (msg: UserMessage) => void): void;
}

export class NoopSessionSyncClient implements SessionSyncClient {
  private metadata: SessionMetadata = {};
  private state: AgentState = {};

  async connect(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    return;
  }

  async flush(): Promise<void> {
    return;
  }

  keepAlive(): void {
    return;
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

  onUserMessage(): void {
    return;
  }
}
