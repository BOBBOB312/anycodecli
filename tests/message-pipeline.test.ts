import { describe, it, expect } from "vitest";
import { MessagePipeline } from "../src/domain/session/message-pipeline.js";

describe("MessagePipeline", () => {
  it("batches messages with same mode hash", async () => {
    const q = new MessagePipeline<{ mode: string }>((m) => m.mode);
    q.push("a", { mode: "x" });
    q.push("b", { mode: "x" });
    q.push("c", { mode: "y" });

    const first = await q.waitForMessagesAndGetAsString();
    const second = await q.waitForMessagesAndGetAsString();

    expect(first?.message).toBe("a\nb");
    expect(first?.hash).toBe("x");
    expect(second?.message).toBe("c");
    expect(second?.hash).toBe("y");
  });

  it("isolates message and clears old queue", async () => {
    const q = new MessagePipeline<string>((m) => m);
    q.push("old", "local");
    q.pushIsolateAndClear("only", "remote");
    q.push("next", "remote");

    const first = await q.waitForMessagesAndGetAsString();
    const second = await q.waitForMessagesAndGetAsString();

    expect(first?.message).toBe("only");
    expect(first?.isolate).toBe(true);
    expect(second?.message).toBe("next");
  });
});
