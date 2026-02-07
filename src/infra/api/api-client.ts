/**
 * API client contract — thin wrapper over happy-cli's ApiClient.
 * Phase B legacy delegation: real HTTP/encryption stays in happy-cli,
 * this layer defines the interface for future native implementation.
 */

import type { Session, Machine, MachineMetadata, DaemonState, AgentState, Metadata } from "./types.js";

export interface GetOrCreateSessionInput {
  tag: string;
  metadata: Metadata;
  state: AgentState | null;
}

export interface GetOrCreateMachineInput {
  machineId: string;
  metadata: MachineMetadata;
  daemonState?: DaemonState;
}

export interface ApiClient {
  getOrCreateSession(input: GetOrCreateSessionInput): Promise<Session | null>;
  getOrCreateMachine(input: GetOrCreateMachineInput): Promise<Machine>;
  registerVendorToken(vendor: "openai" | "anthropic" | "gemini", apiKey: unknown): Promise<void>;
  getVendorToken(vendor: "openai" | "anthropic" | "gemini"): Promise<unknown | null>;
}
