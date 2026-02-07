interface QueueItem<TMode> {
  message: string;
  mode: TMode;
  modeHash: string;
  isolate: boolean;
}

export interface MessageBatch<TMode> {
  message: string;
  mode: TMode;
  hash: string;
  isolate: boolean;
}

export class MessagePipeline<TMode> {
  private queue: QueueItem<TMode>[] = [];
  private waiter: ((hasMessages: boolean) => void) | null = null;
  private closed = false;

  constructor(private readonly modeHasher: (mode: TMode) => string) {}

  push(message: string, mode: TMode): void {
    this.assertOpen();
    this.queue.push({
      message,
      mode,
      modeHash: this.modeHasher(mode),
      isolate: false
    });
    this.wakeup(true);
  }

  pushImmediate(message: string, mode: TMode): void {
    this.push(message, mode);
  }

  pushIsolateAndClear(message: string, mode: TMode): void {
    this.assertOpen();
    this.queue = [
      {
        message,
        mode,
        modeHash: this.modeHasher(mode),
        isolate: true
      }
    ];
    this.wakeup(true);
  }

  unshift(message: string, mode: TMode): void {
    this.assertOpen();
    this.queue.unshift({
      message,
      mode,
      modeHash: this.modeHasher(mode),
      isolate: false
    });
    this.wakeup(true);
  }

  reset(): void {
    this.queue = [];
    this.closed = false;
    this.waiter = null;
  }

  close(): void {
    this.closed = true;
    this.wakeup(false);
  }

  isClosed(): boolean {
    return this.closed;
  }

  size(): number {
    return this.queue.length;
  }

  async waitForMessagesAndGetAsString(signal?: AbortSignal): Promise<MessageBatch<TMode> | null> {
    if (this.queue.length > 0) {
      return this.collectBatch();
    }

    if (this.closed || signal?.aborted) {
      return null;
    }

    const hasMessages = await this.waitForMessages(signal);
    if (!hasMessages) {
      return null;
    }

    return this.collectBatch();
  }

  private collectBatch(): MessageBatch<TMode> | null {
    if (this.queue.length === 0) {
      return null;
    }

    const first = this.queue[0];
    const parts: string[] = [];

    if (first.isolate) {
      parts.push(this.queue.shift()!.message);
    } else {
      while (this.queue.length > 0) {
        const next = this.queue[0];
        if (next.isolate || next.modeHash !== first.modeHash) {
          break;
        }
        parts.push(this.queue.shift()!.message);
      }
    }

    return {
      message: parts.join("\n"),
      mode: first.mode,
      hash: first.modeHash,
      isolate: first.isolate
    };
  }

  private waitForMessages(signal?: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
      const onAbort = () => {
        if (this.waiter === onWait) {
          this.waiter = null;
        }
        resolve(false);
      };

      const onWait = (hasMessages: boolean) => {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
        resolve(hasMessages);
      };

      if (signal) {
        signal.addEventListener("abort", onAbort);
      }

      if (this.queue.length > 0) {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
        resolve(true);
        return;
      }

      if (this.closed || signal?.aborted) {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
        resolve(false);
        return;
      }

      this.waiter = onWait;
    });
  }

  private assertOpen(): void {
    if (this.closed) {
      throw new Error("Cannot enqueue into a closed MessagePipeline");
    }
  }

  private wakeup(hasMessages: boolean): void {
    if (!this.waiter) {
      return;
    }

    const waiter = this.waiter;
    this.waiter = null;
    waiter(hasMessages);
  }
}
