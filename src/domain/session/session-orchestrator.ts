import type { RuntimeFactory } from "../../agents/contracts/session-runtime.js";
import type { SessionMode } from "../../infra/api/session-sync-client.js";
import { SessionLifecycle } from "./session-lifecycle.js";

export interface StartSessionInput {
  startingMode?: SessionMode;
}

export class SessionOrchestrator {
  private started = false;
  private mode: SessionMode = "local";

  constructor(
    private readonly runtimeFactory: RuntimeFactory,
    private readonly lifecycle: SessionLifecycle
  ) {}

  async start(input: StartSessionInput = {}): Promise<void> {
    if (this.started) {
      throw new Error("SessionOrchestrator already started");
    }

    this.mode = input.startingMode ?? "local";
    this.started = true;

    await this.lifecycle.start();
    this.lifecycle.onModeChange(this.mode);

    while (true) {
      const runtime = this.runtimeFactory.create(this.mode);
      const reason = await runtime.run();
      if (reason === "exit") {
        await this.lifecycle.stop();
        return;
      }

      this.mode = this.mode === "local" ? "remote" : "local";
      this.lifecycle.onModeChange(this.mode);
    }
  }
}
