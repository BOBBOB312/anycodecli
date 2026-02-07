/**
 * ACP session update dispatch contract.
 * Defines the interface for handling session update notifications from ACP agents.
 * Maps ACP session updates → unified AgentMessage format.
 */

import type { AgentMessage } from "../contracts/agent-message.js";

export interface SessionUpdate {
  sessionUpdate?: string;
  toolCallId?: string;
  status?: string;
  kind?: string | unknown;
  content?: { text?: string; error?: string | { message?: string }; [key: string]: unknown } | string | unknown;
  messageChunk?: { textDelta?: string };
  plan?: unknown;
  thinking?: unknown;
  [key: string]: unknown;
}

export interface SessionUpdateHandler {
  handle(update: SessionUpdate): AgentMessage | null;
}

/**
 * Default handler that maps common ACP session updates to AgentMessages.
 */
export class DefaultSessionUpdateHandler implements SessionUpdateHandler {
  handle(update: SessionUpdate): AgentMessage | null {
    const kind = update.sessionUpdate ?? update.kind;

    if (kind === "agentMessageChunk" && update.messageChunk?.textDelta) {
      return { type: "model-output", textDelta: update.messageChunk.textDelta };
    }

    if (kind === "toolCall" && update.toolCallId) {
      return {
        type: "tool-call",
        toolName: String((update.content as Record<string, unknown>)?.["toolName"] ?? "unknown"),
        args: ((update.content as Record<string, unknown>)?.["args"] as Record<string, unknown>) ?? {},
        callId: update.toolCallId
      };
    }

    if (kind === "toolCallResult" && update.toolCallId) {
      return {
        type: "tool-result",
        toolName: "unknown",
        result: update.content,
        callId: update.toolCallId
      };
    }

    return null;
  }
}
