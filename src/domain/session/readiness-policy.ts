/**
 * Readiness policy — determines when a session is considered "ready".
 * Extracted from provider-specific ready detection logic.
 */

export interface ReadinessPolicy {
  isReady(): boolean;
  markReady(): void;
  reset(): void;
}

/**
 * Simple flag-based readiness — ready once explicitly marked.
 */
export class FlagReadinessPolicy implements ReadinessPolicy {
  private ready = false;

  isReady(): boolean {
    return this.ready;
  }

  markReady(): void {
    this.ready = true;
  }

  reset(): void {
    this.ready = false;
  }
}
