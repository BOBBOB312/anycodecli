/**
 * ACP process lifecycle management contract.
 * Defines the interface for spawning/terminating ACP agent child processes.
 * Real implementation (stdio lifecycle, stream management) lives in happy-cli.
 */

export interface AcpProcessOptions {
  command: string;
  args?: string[];
  cwd: string;
  env?: Record<string, string>;
}

export interface AcpProcess {
  start(options: AcpProcessOptions): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

/**
 * Noop implementation for testing / offline scenarios.
 */
export class NoopAcpProcess implements AcpProcess {
  private running = false;

  async start(_options: AcpProcessOptions): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
