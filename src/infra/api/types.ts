/**
 * Unified API type definitions — single source of truth.
 * Mirrors happy-cli/src/api/types.ts wire contracts exactly.
 */

export type PermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan"
  | "read-only"
  | "safe-yolo"
  | "yolo";

export interface SessionMessageContent {
  c: string;
  t: "encrypted";
}

export interface Metadata {
  path: string;
  host: string;
  version?: string;
  name?: string;
  os?: string;
  summary?: { text: string; updatedAt: number };
  machineId?: string;
  claudeSessionId?: string;
  tools?: string[];
  slashCommands?: string[];
  homeDir: string;
  happyHomeDir: string;
  happyLibDir: string;
  happyToolsDir: string;
  startedFromDaemon?: boolean;
  hostPid?: number;
  startedBy?: "daemon" | "terminal";
  lifecycleState?: "running" | "archiveRequested" | "archived" | string;
  lifecycleStateSince?: number;
  archivedBy?: string;
  archiveReason?: string;
  flavor?: string;
}

export interface MachineMetadata {
  host: string;
  platform: string;
  happyCliVersion: string;
  homeDir: string;
  happyHomeDir: string;
  happyLibDir: string;
}

export interface DaemonState {
  status: "running" | "shutting-down" | string;
  pid?: number;
  httpPort?: number;
  startedAt?: number;
  shutdownRequestedAt?: number;
  shutdownSource?: "mobile-app" | "cli" | "os-signal" | "unknown" | string;
}

export interface Session {
  id: string;
  seq: number;
  encryptionKey: Uint8Array;
  encryptionVariant: "legacy" | "dataKey";
  metadata: Metadata;
  metadataVersion: number;
  agentState: AgentState | null;
  agentStateVersion: number;
}

export interface Machine {
  id: string;
  encryptionKey: Uint8Array;
  encryptionVariant: "legacy" | "dataKey";
  metadata: MachineMetadata;
  metadataVersion: number;
  daemonState: DaemonState | null;
  daemonStateVersion: number;
}

export interface AgentState {
  controlledByUser?: boolean | null;
  requests?: Record<string, { tool: string; arguments: unknown; createdAt: number }>;
  completedRequests?: Record<
    string,
    {
      tool: string;
      arguments: unknown;
      createdAt: number;
      completedAt: number;
      status: "canceled" | "denied" | "approved";
      reason?: string;
      mode?: PermissionMode;
      decision?: "approved" | "approved_for_session" | "denied" | "abort";
      allowTools?: string[];
    }
  >;
}

export interface MessageMeta {
  sentFrom?: string;
  permissionMode?: PermissionMode;
  model?: string | null;
  fallbackModel?: string | null;
  customSystemPrompt?: string | null;
  appendSystemPrompt?: string | null;
  allowedTools?: string[] | null;
  disallowedTools?: string[] | null;
}

export interface UserMessage {
  role: "user";
  content: { type: "text"; text: string };
  localKey?: string;
  meta?: MessageMeta;
}

export interface AgentApiMessage {
  role: "agent";
  content: { type: "output"; data: unknown };
  meta?: MessageMeta;
}

export type MessageContent = UserMessage | AgentApiMessage;

export type ACPProvider = "gemini" | "codex" | "claude" | "opencode";

export type ACPMessageData =
  | { type: "message"; message: string }
  | { type: "reasoning"; message: string }
  | { type: "thinking"; text: string }
  | { type: "tool-call"; callId: string; name: string; input: unknown; id: string }
  | { type: "tool-result"; callId: string; output: unknown; id: string; isError?: boolean }
  | { type: "file-edit"; description: string; filePath: string; diff?: string; oldContent?: string; newContent?: string; id: string }
  | { type: "terminal-output"; data: string; callId: string }
  | { type: "task_started"; id: string }
  | { type: "task_complete"; id: string }
  | { type: "turn_aborted"; id: string }
  | { type: "permission-request"; permissionId: string; toolName: string; description: string; options?: unknown }
  | { type: "token_count"; [key: string]: unknown };
