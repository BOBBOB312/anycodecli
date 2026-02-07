import type { AgentMessageHandler } from "./agent-message.js";

export type SessionId = string;

export interface AgentBackend {
  startSession(initialPrompt?: string): Promise<{ sessionId: SessionId }>;
  sendPrompt(sessionId: SessionId, prompt: string): Promise<void>;
  cancel(sessionId: SessionId): Promise<void>;
  onMessage(handler: AgentMessageHandler): void;
  dispose(): Promise<void>;
}
