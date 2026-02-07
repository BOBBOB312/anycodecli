export interface TrackedSession {
  sessionId: string;
  directory?: string;
  startedAt: number;
}

export class ChildRegistry {
  private readonly sessions = new Map<string, TrackedSession>();

  register(session: TrackedSession): void {
    this.sessions.set(session.sessionId, session);
  }

  unregister(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  list(): TrackedSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => a.startedAt - b.startedAt);
  }

  clear(): void {
    this.sessions.clear();
  }
}
