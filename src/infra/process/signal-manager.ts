/**
 * Signal manager — centralizes process signal handling.
 * Prevents scattered signal listeners across modules.
 */

export type SignalHandler = () => void;

export class SignalManager {
  private handlers = new Map<NodeJS.Signals, SignalHandler[]>();
  private registered = false;

  on(signal: NodeJS.Signals, handler: SignalHandler): void {
    if (!this.handlers.has(signal)) {
      this.handlers.set(signal, []);
    }
    this.handlers.get(signal)!.push(handler);

    if (!this.registered) {
      this.install();
    }
  }

  private install(): void {
    this.registered = true;
    for (const signal of this.handlers.keys()) {
      process.on(signal, () => {
        const fns = this.handlers.get(signal) ?? [];
        for (const fn of fns) fn();
      });
    }
  }

  dispose(): void {
    this.handlers.clear();
  }
}
