/**
 * Daemon HTTP control client contract.
 * Mirrors happy-cli's controlClient.ts interface.
 * Used by CLI commands to interact with a running daemon.
 */

export interface DaemonSessionInfo {
  startedBy: string;
  happySessionId: string;
  pid: number;
}

export interface ControlClient {
  listSessions(): Promise<DaemonSessionInfo[]>;
  stopSession(sessionId: string): Promise<boolean>;
  spawnSession(directory: string, sessionId?: string): Promise<unknown>;
  stopDaemon(): Promise<void>;
  notifySessionStarted(sessionId: string, metadata: unknown): Promise<void>;
  isDaemonRunning(): Promise<boolean>;
  isDaemonRunningCurrentVersion(): Promise<boolean>;
}

/**
 * Noop implementation for testing.
 */
export class NoopControlClient implements ControlClient {
  async listSessions(): Promise<DaemonSessionInfo[]> { return []; }
  async stopSession(_sessionId: string): Promise<boolean> { return false; }
  async spawnSession(_directory: string, _sessionId?: string): Promise<unknown> { return { success: false }; }
  async stopDaemon(): Promise<void> {}
  async notifySessionStarted(_sessionId: string, _metadata: unknown): Promise<void> {}
  async isDaemonRunning(): Promise<boolean> { return false; }
  async isDaemonRunningCurrentVersion(): Promise<boolean> { return false; }
}
