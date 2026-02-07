/**
 * Machine service contract.
 * Handles machine registration and metadata management.
 * Delegates to ApiClient for server communication.
 */

import type { Machine, MachineMetadata, DaemonState } from "../../infra/api/types.js";
import type { ApiClient } from "../../infra/api/api-client.js";

export interface MachineService {
  getOrCreateMachine(machineId: string, metadata: MachineMetadata, daemonState?: DaemonState): Promise<Machine>;
}

export class DefaultMachineService implements MachineService {
  constructor(private readonly api: ApiClient) {}

  async getOrCreateMachine(machineId: string, metadata: MachineMetadata, daemonState?: DaemonState): Promise<Machine> {
    return this.api.getOrCreateMachine({ machineId, metadata, daemonState });
  }
}
