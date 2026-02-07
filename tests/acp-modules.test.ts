import { describe, it, expect } from "vitest";
import { AcpRuntimeFactory } from "../src/agents/acp/acp-runtime.js";
import { NoopAcpProcess } from "../src/agents/acp/acp-process.js";
import { DefaultSessionUpdateHandler } from "../src/agents/acp/acp-session-updates.js";
import { AutoApprovePermissionHandler } from "../src/agents/acp/acp-permissions.js";

describe("AcpRuntimeFactory", () => {
  it("creates a runtime for the given mode", () => {
    const spawner = { spawn: () => ({ kill: () => true, on: () => ({}) }) as any };
    const factory = new AcpRuntimeFactory("gemini", spawner);
    const runtime = factory.create("local");
    expect(runtime).toBeDefined();
    expect(typeof runtime.run).toBe("function");
  });
});

describe("NoopAcpProcess", () => {
  it("tracks running state", async () => {
    const proc = new NoopAcpProcess();
    expect(proc.isRunning()).toBe(false);
    await proc.start({ command: "test", cwd: "/tmp" });
    expect(proc.isRunning()).toBe(true);
    await proc.stop();
    expect(proc.isRunning()).toBe(false);
  });
});

describe("DefaultSessionUpdateHandler", () => {
  it("maps agentMessageChunk to model-output", () => {
    const handler = new DefaultSessionUpdateHandler();
    const result = handler.handle({
      sessionUpdate: "agentMessageChunk",
      messageChunk: { textDelta: "hello" }
    });
    expect(result).toEqual({ type: "model-output", textDelta: "hello" });
  });

  it("returns null for unknown update types", () => {
    const handler = new DefaultSessionUpdateHandler();
    expect(handler.handle({ sessionUpdate: "unknown" })).toBeNull();
  });
});

describe("AutoApprovePermissionHandler", () => {
  it("always approves", async () => {
    const handler = new AutoApprovePermissionHandler();
    const decision = await handler.requestPermission({
      id: "1", toolName: "write_file", description: "test", payload: {}
    });
    expect(decision).toBe("approved");
  });
});
