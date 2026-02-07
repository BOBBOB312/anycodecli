export interface SpawnSessionInput {
  directory: string;
  sessionId?: string;
}

export interface DaemonGateway {
  start(): Promise<number>;
  stop(): Promise<number>;
  status(): Promise<number>;
  list(): Promise<number>;
  stopSession(sessionId: string): Promise<number>;
  spawnSession(input: SpawnSessionInput): Promise<number>;
  passthrough(args: string[]): Promise<number>;
}
