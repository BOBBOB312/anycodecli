import type { RuntimeFactory } from "../../agents/contracts/session-runtime.js";
import { ClaudeRuntimeFactory } from "../../agents/claude/claude-runtime.js";
import { CodexRuntimeFactory } from "../../agents/codex/codex-runtime.js";
import { GeminiRuntimeFactory } from "../../agents/gemini/gemini-runtime.js";
import type { ProcessSpawner } from "../../infra/process/process-spawner.js";

export type Provider = "claude" | "codex" | "gemini";

export function createLegacyRuntimeFactory(
  provider: Provider,
  spawner: ProcessSpawner,
  passthroughArgs: string[]
): RuntimeFactory {
  switch (provider) {
    case "claude":
      return new ClaudeRuntimeFactory(spawner, passthroughArgs);
    case "codex":
      return new CodexRuntimeFactory(spawner, passthroughArgs);
    case "gemini":
      return new GeminiRuntimeFactory(spawner, passthroughArgs);
  }
}
