# anycodecli Interface Contracts

> 本文档定义重构后的核心接口契约，作为模块边界与评审基准。

## 1. 命令层契约

```ts
export interface CommandContext {
  logger: {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
  };
  config: AppConfig;
  services: ServiceContainer;
}

export interface CommandModule {
  name: string;
  run(argv: string[], ctx: CommandContext): Promise<number>;
}
```

约束：

- `run()` 只返回退出码，不直接 `process.exit()`。
- 命令层不直接访问 socket/进程/文件系统，统一通过 `services`。

## 2. 会话编排契约

```ts
export type Provider = 'claude' | 'codex' | 'gemini';
export type SessionMode = 'local' | 'remote';

export interface StartSessionInput {
  provider: Provider;
  cwd: string;
  startedBy?: 'daemon' | 'terminal';
  startingMode?: SessionMode;
  model?: string;
  permissionMode?: string;
  additionalArgs?: string[];
}

export interface SessionOrchestrator {
  start(input: StartSessionInput): Promise<void>;
  abort(reason?: string): Promise<void>;
  kill(reason: string): Promise<void>;
  switchMode(nextMode: SessionMode): Promise<void>;
}
```

约束：

- 事件顺序必须稳定：`task_started` -> `task_complete/turn_aborted`。
- `abort()` 只中断当前轮，不销毁会话；`kill()` 销毁资源并不可恢复。

## 3. Agent 后端契约

```ts
export type SessionId = string;

export type AgentMessage =
  | { type: 'model-output'; textDelta?: string; fullText?: string }
  | { type: 'status'; status: 'starting' | 'running' | 'idle' | 'stopped' | 'error'; detail?: string }
  | { type: 'tool-call'; toolName: string; args: Record<string, unknown>; callId: string }
  | { type: 'tool-result'; toolName: string; result: unknown; callId: string }
  | { type: 'permission-request'; id: string; reason: string; payload: unknown }
  | { type: 'permission-response'; id: string; approved: boolean }
  | { type: 'terminal-output'; data: string }
  | { type: 'event'; name: string; payload: unknown }
  | { type: 'token-count'; [key: string]: unknown };

export interface AgentBackend {
  startSession(initialPrompt?: string): Promise<{ sessionId: SessionId }>;
  sendPrompt(sessionId: SessionId, prompt: string): Promise<void>;
  cancel(sessionId: SessionId): Promise<void>;
  onMessage(handler: (msg: AgentMessage) => void): void;
  dispose(): Promise<void>;
}
```

约束：

- `AgentMessage` 只能有一个定义源，不允许重复声明。
- Provider 差异只体现在 backend 内部，不向 `domain` 层泄漏。

## 4. 同步层契约（会话）

```ts
export interface SessionSyncClient {
  connect(): Promise<void>;
  close(): Promise<void>;
  flush(): Promise<void>;

  sendAgentMessage(provider: Provider, message: unknown): void;
  sendSessionEvent(event: unknown): void;
  keepAlive(thinking: boolean, mode: SessionMode): void;

  updateMetadata(handler: (prev: SessionMetadata) => SessionMetadata): Promise<void>;
  updateAgentState(handler: (prev: AgentState) => AgentState): Promise<void>;

  onUserMessage(handler: (msg: UserMessage) => void): void;
}
```

约束：

- `updateMetadata` / `updateAgentState` 使用乐观并发版本控制。
- `flush()` 失败不应导致进程崩溃，最多降级为 warning。

## 5. Daemon 编排契约

```ts
export interface SpawnSessionInput {
  directory: string;
  sessionId?: string;
  approvedNewDirectoryCreation?: boolean;
  provider?: Provider;
}

export type SpawnSessionResult =
  | { type: 'success'; sessionId: string }
  | { type: 'requestToApproveDirectoryCreation'; directory: string }
  | { type: 'error'; errorMessage: string };

export interface DaemonOrchestrator {
  start(): Promise<void>;
  stop(source: 'app' | 'cli' | 'signal' | 'exception'): Promise<void>;
  listSessions(): Promise<Array<{ sessionId: string; pid: number; startedBy: string }>>;
  stopSession(sessionId: string): Promise<boolean>;
  spawnSession(input: SpawnSessionInput): Promise<SpawnSessionResult>;
}
```

约束：

- `start()` 幂等；重复调用不应产生重复服务实例。
- `stop()` 必须确保子进程回收与状态落盘。

## 6. 错误模型契约

```ts
export type AppErrorCode =
  | 'INVALID_ARGS'
  | 'AUTH_REQUIRED'
  | 'NETWORK_UNAVAILABLE'
  | 'SERVER_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'SESSION_NOT_FOUND'
  | 'DAEMON_NOT_RUNNING'
  | 'INTERNAL_ERROR';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
  retryable?: boolean;
}
```

约束：

- 对外错误文本语义保持一致；内部可附带结构化 `code`。
- 所有 catch 分支禁止吞错，至少记录 `code + message`。

## 7. 可观测性契约

- 必打点字段：`sessionId`、`provider`、`mode`、`startedBy`、`requestId`。
- 日志级别约束：
  - `debug`：协议细节、重试、分支决策。
  - `info`：状态切换、启动/停止。
  - `warn`：可恢复异常。
  - `error`：不可恢复异常。

## 8. 兼容性守卫

- 任何接口变更必须同时更新：
  1. `REFACTOR_PLAN.md`
  2. parity 测试
  3. `MIGRATION_SIGNOFF.md` 差异说明
