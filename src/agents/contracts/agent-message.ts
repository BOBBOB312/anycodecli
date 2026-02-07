export type AgentMessage =
  | { type: "model-output"; textDelta?: string; fullText?: string }
  | { type: "status"; status: "starting" | "running" | "idle" | "stopped" | "error"; detail?: string }
  | { type: "tool-call"; toolName: string; args: Record<string, unknown>; callId: string }
  | { type: "tool-result"; toolName: string; result: unknown; callId: string }
  | { type: "permission-request"; id: string; reason: string; payload: unknown }
  | { type: "permission-response"; id: string; approved: boolean }
  | { type: "terminal-output"; data: string }
  | { type: "event"; name: string; payload: unknown }
  | { type: "token-count"; [key: string]: unknown };

export type AgentMessageHandler = (msg: AgentMessage) => void;
