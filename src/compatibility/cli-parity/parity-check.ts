/**
 * CLI parity verification utilities.
 * Used to ensure refactored commands produce identical output to legacy.
 */

export interface ParityCheck {
  command: string;
  args: string[];
  expectedExitCode: number;
  stdoutContains?: string[];
  stderrContains?: string[];
}

export function createParityCheck(command: string, args: string[], expectedExitCode = 0): ParityCheck {
  return { command, args, expectedExitCode };
}
