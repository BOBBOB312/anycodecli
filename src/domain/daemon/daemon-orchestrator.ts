import type { DaemonGateway } from "./types.js";
import { ChildRegistry } from "./child-registry.js";
import { SpawnService } from "./spawn-service.js";
import { HeartbeatService } from "./heartbeat-service.js";

export class DaemonOrchestrator {
  private readonly registry: ChildRegistry;
  private readonly spawnService: SpawnService;
  private readonly heartbeat: HeartbeatService;

  constructor(
    private readonly gateway: DaemonGateway,
    options?: {
      registry?: ChildRegistry;
      spawnService?: SpawnService;
      heartbeat?: HeartbeatService;
    }
  ) {
    this.registry = options?.registry ?? new ChildRegistry();
    this.spawnService = options?.spawnService ?? new SpawnService(gateway, this.registry);
    this.heartbeat = options?.heartbeat ?? new HeartbeatService();
  }

  async start(): Promise<number> {
    const code = await this.gateway.start();
    if (code === 0) {
      this.heartbeat.start();
    }
    return code;
  }

  async stop(): Promise<number> {
    this.heartbeat.stop();
    this.registry.clear();
    return this.gateway.stop();
  }

  status(): Promise<number> {
    return this.gateway.status();
  }

  list(): Promise<number> {
    return this.gateway.list();
  }

  stopSession(sessionId: string): Promise<number> {
    return this.spawnService.stopSession(sessionId);
  }

  spawnSession(directory: string, sessionId?: string): Promise<number> {
    return this.spawnService.spawn({ directory, sessionId });
  }

  passthrough(args: string[]): Promise<number> {
    return this.gateway.passthrough(args);
  }
}
