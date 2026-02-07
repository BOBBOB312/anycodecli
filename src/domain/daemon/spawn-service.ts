import type { DaemonGateway, SpawnSessionInput } from "./types.js";
import { ChildRegistry } from "./child-registry.js";

export class SpawnService {
  constructor(
    private readonly gateway: DaemonGateway,
    private readonly registry: ChildRegistry
  ) {}

  async spawn(input: SpawnSessionInput): Promise<number> {
    const code = await this.gateway.spawnSession(input);
    if (code === 0 && input.sessionId) {
      this.registry.register({
        sessionId: input.sessionId,
        directory: input.directory,
        startedAt: Date.now()
      });
    }
    return code;
  }

  async stopSession(sessionId: string): Promise<number> {
    const code = await this.gateway.stopSession(sessionId);
    if (code === 0) {
      this.registry.unregister(sessionId);
    }
    return code;
  }
}
