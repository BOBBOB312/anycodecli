/**
 * Logger contract.
 * Mirrors happy-cli's logger interface with level constraints from INTERFACE_CONTRACTS.
 */

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Console-based logger for development / fallback.
 */
export class ConsoleLogger implements Logger {
  debug(_message: string, _data?: unknown): void {
    if (process.env.DEBUG) console.debug(_message, _data ?? "");
  }
  info(message: string, data?: unknown): void {
    console.info(message, data ?? "");
  }
  warn(message: string, data?: unknown): void {
    console.warn(message, data ?? "");
  }
  error(message: string, data?: unknown): void {
    console.error(message, data ?? "");
  }
}

/**
 * Silent logger for testing.
 */
export class NoopLogger implements Logger {
  debug(_message?: string, _data?: unknown): void {}
  info(_message?: string, _data?: unknown): void {}
  warn(_message?: string, _data?: unknown): void {}
  error(_message?: string, _data?: unknown): void {}
}
