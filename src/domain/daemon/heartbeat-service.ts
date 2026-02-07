export class HeartbeatService {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly intervalMs = 10000,
    private readonly onTick: () => void = () => {}
  ) {}

  start(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      this.onTick();
    }, this.intervalMs);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }

  isRunning(): boolean {
    return this.timer !== null;
  }
}
