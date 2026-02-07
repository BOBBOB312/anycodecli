import type { SubcommandGateway } from "./types.js";

export class SubcommandOrchestrator {
  constructor(private readonly gateway: SubcommandGateway) {}

  run(args: string[]): Promise<number> {
    return this.gateway.run(args);
  }
}
