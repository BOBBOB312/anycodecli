# anycodecli 详细重构方案（模块化 + 零功能差异）

## 当前落地进度（已完成）

- 已建立 `app/bootstrap` + `app/command-router` 结构。
- 已建立 `commands/*` 子命令模块。
- 当前命令实现采用“legacy delegation”，确保行为不漂移。
- 已补充基础路由测试，验证分发与参数透传。
- 已完成第二阶段基础内核落地：
  - `session-sync-client` 契约与 Noop 实现
  - `message-pipeline` 队列实现
  - `session-lifecycle`（keepAlive / mode switch / cleanup）
  - `session-orchestrator`（local/remote 切换编排）
- 已完成第三阶段基础骨架：
  - `AgentMessage` / `AgentBackend` 单一契约源
  - `legacy-process-session-runtime` 统一运行时桥接
  - Claude/Codex/Gemini runtime factory
  - provider -> runtime 的域内工厂映射
  - agent 命令接入 `SessionOrchestrator`（已不再直接 delegate）
  - 运行时依赖已注入化（`ProcessSpawner` / `SessionSyncClientFactory`）
  - daemon 命令已接入 `DaemonOrchestrator` + `LegacyDaemonGateway`
  - 其余 legacy 命令改为统一 `createLegacyCommand` 工厂
  - daemon 内核拆分完成：`child-registry` / `spawn-service` / `heartbeat-service`
  - session sync 工厂支持 `legacy|noop` 模式切换
  - 命令层分层完成：agent/daemon/subcommand 均通过 domain orchestrator + gateway
  - bootstrap 依赖装配抽离到 `context-factory`
  - 新增 bootstrap parity 测试，验证命令转发与 agent 编排转发行为
- 已完成 Batch B（API 与同步层）契约落地：
  - `infra/api/types.ts` — 统一 API 类型定义（单一来源）
  - `infra/api/api-client.ts` — ApiClient 接口契约
  - `infra/api/machine-sync-client.ts` — MachineSyncClient 契约 + Noop 实现
- 已完成 Batch D（ACP 与 Agent 抽象）契约落地：
  - `agents/acp/acp-runtime.ts` — ACP 运行时工厂（legacy delegation）
  - `agents/acp/acp-process.ts` — ACP 进程生命周期契约 + Noop 实现
  - `agents/acp/acp-session-updates.ts` — session update 分发契约 + 默认实现
  - `agents/acp/acp-permissions.ts` — permission 管线契约 + AutoApprove 实现
  - `agents/contracts/permission-handler.ts` — 通用 permission handler 契约
- 已完成 Batch E（Daemon HTTP 层）契约落地：
  - `infra/daemon-http/control-server.ts` — HTTP 控制服务器契约
  - `infra/daemon-http/control-client.ts` — HTTP 控制客户端契约 + Noop 实现
- 已完成基础设施契约落地：
  - `infra/rpc/rpc-handler-registry.ts` — RPC handler 注册表契约
  - `infra/persistence/persistence.ts` — 持久化层契约
  - `infra/logging/logger.ts` — 日志契约 + Console/Noop 实现
  - `infra/process/signal-manager.ts` — 集中式信号管理
  - `domain/machine/machine-service.ts` — 机器注册服务
  - `domain/session/readiness-policy.ts` — 会话就绪策略
- 已完成 compatibility 目录结构
- 已完成 Batch F 命名统一（binary/env/package 均为 anycodecli）
- 目标架构中所有文件均已就位（59 个 .ts 源文件）
- 全部 48 个测试通过，类型检查通过

## 1. 背景结论（基于现有工程分析）

当前工程功能完整，但存在典型“增长后耦合”问题：

- 入口文件过大，命令解析和业务执行耦合在一起。
- Claude/Codex/Gemini 各自维护一套生命周期，重复逻辑较多。
- Daemon 逻辑纵向过深，状态、进程、HTTP、心跳、版本漂移集中在单文件。
- 协议层（socket + 加密 + 状态更新 + RPC）职责边界不够清晰。
- 类型定义有重复来源，导致演进风险增加。

本方案目标是：在不改变功能与行为的前提下，把架构拆成“可替换、可测试、可演进”的模块。

## 2. 重构目标与硬约束

- 功能零差异：命令行为、参数语义、默认值、错误码、输出语义保持一致。
- 协议零差异：RPC 名称、事件顺序、消息字段、加密方式保持一致。
- 运行零差异：本地模式、远程模式、Daemon、离线回退、重连流程保持一致。
- 命名统一：重构后仅使用 `anycodecli` 命名（代码、文档、二进制、路径、env 前缀）。

## 3. 目标架构（分层）

```txt
anycodecli/
  src/
    app/
      bootstrap.ts
      command-router.ts
      command-context.ts

    commands/
      claude/command.ts
      codex/command.ts
      gemini/command.ts
      daemon/command.ts
      auth/command.ts
      connect/command.ts
      doctor/command.ts
      notify/command.ts

    domain/
      session/
        session-orchestrator.ts
        session-lifecycle.ts
        message-pipeline.ts
        readiness-policy.ts
      daemon/
        daemon-orchestrator.ts
        child-registry.ts
        spawn-service.ts
        heartbeat-service.ts
      machine/
        machine-service.ts

    agents/
      contracts/
        agent-backend.ts
        agent-message.ts
        permission-handler.ts
      claude/
        claude-runtime.ts
      codex/
        codex-runtime.ts
      gemini/
        gemini-runtime.ts
      acp/
        acp-runtime.ts
        acp-process.ts
        acp-session-updates.ts
        acp-permissions.ts

    infra/
      api/
        api-client.ts
        session-sync-client.ts
        machine-sync-client.ts
      rpc/
        rpc-handler-registry.ts
      daemon-http/
        control-server.ts
        control-client.ts
      persistence/
        settings-repo.ts
        credentials-repo.ts
        daemon-state-repo.ts
      process/
        process-spawner.ts
        signal-manager.ts
      logging/
        logger.ts

    compatibility/
      cli-parity/
      snapshots/
      migration/
```

## 4. 模块职责定义

- `app/*`：仅负责启动、依赖装配、命令路由。
- `commands/*`：只做参数解析、调用编排，不写核心业务。
- `domain/*`：会话状态机、daemon 状态机、队列策略、生命周期策略。
- `agents/*`：供应商差异层（Claude/Codex/Gemini/ACP），统一实现 `AgentBackend`。
- `infra/*`：外部依赖适配（API、socket、RPC、文件系统、进程）。
- `compatibility/*`：用于“行为不变”验证（golden files + parity tests）。

## 5. 关键接口设计

## 5.1 命令接口

```ts
export interface CommandContext {
  logger: Logger;
  config: AppConfig;
  services: ServiceContainer;
}

export interface CommandModule {
  name: string;
  run(argv: string[], ctx: CommandContext): Promise<number>;
}
```

## 5.2 会话编排接口

```ts
export interface StartSessionInput {
  provider: 'claude' | 'codex' | 'gemini';
  startedBy?: 'daemon' | 'terminal';
  startingMode?: 'local' | 'remote';
  model?: string;
}

export interface SessionOrchestrator {
  start(input: StartSessionInput): Promise<void>;
  abort(): Promise<void>;
  kill(reason: string): Promise<void>;
}
```

## 5.3 Agent 后端统一接口

```ts
export interface AgentBackend {
  startSession(initialPrompt?: string): Promise<{ sessionId: string }>;
  sendPrompt(sessionId: string, prompt: string): Promise<void>;
  cancel(sessionId: string): Promise<void>;
  onMessage(handler: (msg: AgentMessage) => void): void;
  dispose(): Promise<void>;
}
```

## 5.4 Daemon 编排接口

```ts
export interface DaemonOrchestrator {
  start(): Promise<void>;
  stop(source: 'app' | 'cli' | 'signal' | 'exception'): Promise<void>;
}

export interface SpawnService {
  spawnSession(input: SpawnSessionInput): Promise<SpawnSessionResult>;
  stopSession(sessionId: string): Promise<boolean>;
}
```

## 6. 数据与协议边界

- 保持现有 wire contract，不做字段变更。
- 统一消息模型单一来源，禁止重复定义。
- socket 的 `update-metadata` / `update-state` 保留现有乐观并发语义。
- Agent event 到移动端消息映射抽到独立 adapter，避免散落在各 runtime。

## 7. 重点重构对象与拆分策略

## 7.1 入口层拆分

- 现状：入口文件承担命令解析 + 业务逻辑 + 输出。
- 方案：
  - 抽 `command-router.ts` 只做路由。
  - 每个子命令迁移到 `commands/*/command.ts`。
  - 共用参数解析逻辑放 `commands/shared/*`。

## 7.2 会话生命周期抽象

- 现状：三种 provider 分别维护 keepAlive、ready、abort、kill。
- 方案：
  - 新建 `session-lifecycle.ts` 统一处理。
  - provider 仅保留差异（协议格式、模型选择、工具结果处理）。

## 7.3 ACP 后端拆分

- 现状：进程管理、流过滤、permission、session-update 分发耦合。
- 方案：
  - `acp-process.ts`：进程启动/终止、stdio 生命周期。
  - `acp-session-updates.ts`：update dispatch。
  - `acp-permissions.ts`：permission 请求与响应。
  - `acp-runtime.ts`：编排层。

## 7.4 Daemon 拆分

- 现状：单文件处理全部逻辑。
- 方案：
  - `daemon-orchestrator.ts`：主流程。
  - `child-registry.ts`：pid/session 跟踪。
  - `spawn-service.ts`：普通 spawn + tmux spawn + env merge。
  - `heartbeat-service.ts`：心跳、版本漂移检测、stale prune。
  - `control-server.ts`：HTTP 路由和 schema。

## 8. 分阶段执行计划

## 阶段 0：基线冻结（1-2 天）

- 建 parity/golden 测试：
  - `anycodecli --help`
  - `anycodecli --version`
  - `anycodecli daemon --help`
  - `anycodecli doctor --help`
- 记录退出码、stdout/stderr、关键日志字段。

## 阶段 1：入口解耦（2-3 天）

- 拆命令路由和子命令模块。
- 验收：命令帮助、错误码、参数透传一致。

## 阶段 2：会话内核抽象（3-5 天）

- 新建 session orchestrator / lifecycle。
- Claude/Codex/Gemini 接入统一内核。
- 验收：abort/kill/ready 时序一致。

## 阶段 3：Agent 层收敛（3-4 天）

- 统一 `AgentMessage` 单一来源。
- ACP backend 拆分为 process/update/permission 三层。
- 验收：tool-call / tool-result / permission 序列一致。

## 阶段 4：Daemon 边界化（3-4 天）

- 拆 daemon orchestrator / spawn / heartbeat / registry。
- 验收：daemon start/stop/status/list/spawn/stop-session 一致。

## 阶段 5：基础设施整理（2-3 天）

- API/sync/persistence 模块化。
- 验收：离线回退与重连行为一致。

## 阶段 6：命名统一与收尾（2-3 天）

- 二进制、文档、env、路径全部统一到 `anycodecli`。
- 增加 CI 命名守卫和全量回归。

## 9. 验收矩阵

- 命令兼容：主命令 + auth/connect/daemon/doctor/notify。
- 会话兼容：本地/远程切换、离线回退、重连、kill/abort。
- Daemon 兼容：状态、子进程跟踪、版本漂移接管。
- 协议兼容：RPC 名称、payload 字段、事件时序。
- 命名兼容：仓库中旧命名搜索结果为 0。

## 10. 风险与回滚

- 风险 1：事件时序漂移。
  - 缓解：事件录制回放测试，按 provider 分套件验证。
- 风险 2：Daemon 多进程竞态。
  - 缓解：锁文件 + stale lock + PID 存活检查集成测试。
- 风险 3：权限请求 ID 映射不一致。
  - 缓解：permission request/response 全链路 E2E。
- 回滚：保留阶段性切换开关，按里程碑回退，不做破坏式回滚。

## 11. 交付物

- `anycodecli/REFACTOR_PLAN.md`（本文件）
- `anycodecli/BASELINE_REPORT.md`
- `anycodecli/MIGRATION_SIGNOFF.md`
- `anycodecli/tests/parity/*`
- `anycodecli/tests/integration/*`

## 12. 命名治理要求（必须满足）

- 二进制名：`anycodecli`。
- 数据目录前缀：`~/.anycodecli`。
- 环境变量前缀：`ANYCODECLI_`。
- README、帮助文案、示例命令全部统一为 `anycodecli`。
- CI 中新增旧命名检测，命中即失败。

---

执行顺序建议：先拆入口，再抽会话内核，再拆 daemon，最后统一命名。这样风险最可控，且每一步都可被自动化回归覆盖。

## 13. 文件级迁移顺序（建议按批次）

### 批次 A：入口与命令层（低风险，高收益）

- `src/index.ts` -> `src/app/bootstrap.ts` + `src/app/command-router.ts`
- 抽出命令：
  - `src/commands/auth/*`
  - `src/commands/connect/*`
  - `src/commands/daemon/*`
  - `src/commands/doctor/*`
  - `src/commands/notify/*`

验收门槛：help/version/exit code 全一致。

### 批次 B：协议与同步层（中风险）

- `src/api/apiSession.ts` ->
  - `src/infra/api/session-sync-client.ts`
  - `src/infra/api/message-codec.ts`
  - `src/infra/api/state-updater.ts`
- `src/api/api.ts` ->
  - `src/infra/api/api-client.ts`
  - `src/domain/machine/machine-service.ts`
  - `src/domain/session/session-service.ts`

验收门槛：socket update/rpc/metadata/state 更新行为一致。

### 批次 C：会话运行时（高风险）

- `src/claude/runClaude.ts`、`src/codex/runCodex.ts`、`src/gemini/runGemini.ts` ->
  - `src/domain/session/session-orchestrator.ts`
  - `src/domain/session/session-lifecycle.ts`
  - `src/agents/*-runtime.ts`
- `src/utils/MessageQueue2.ts` -> `src/domain/session/message-pipeline.ts`

验收门槛：ready/task_started/task_complete/abort 时序不变。

### 批次 D：Daemon（最高风险）

- `src/daemon/run.ts` ->
  - `src/domain/daemon/daemon-orchestrator.ts`
  - `src/domain/daemon/child-registry.ts`
  - `src/domain/daemon/spawn-service.ts`
  - `src/domain/daemon/heartbeat-service.ts`
- `src/daemon/controlServer.ts` -> `src/infra/daemon-http/control-server.ts`

验收门槛：daemon start/stop/status/list/spawn/stop-session 一致；无孤儿进程。

## 14. 重构中的编码守则（避免再次臃肿）

- 单文件超过 350 行需说明理由，超过 500 行需拆分。
- 运行时层不允许直接 `process.exit`，统一在 `bootstrap` 层决定退出码。
- 协议对象（RPC/事件）必须有 schema 与类型双重定义（zod + type）。
- 任何 provider 差异不得污染 `domain` 层，仅可在 `agents/*` 层实现。
- 禁止同一概念多处定义（例如 `AgentMessage` 只能有单一来源）。

## 15. 必补测试清单（建议优先补齐）

- 命令兼容快照：主命令、子命令、异常参数、帮助文本。
- 会话事件回放：
  - 正常回复
  - 工具调用 + 权限请求
  - abort
  - kill session
- 离线恢复：
  - 首次离线启动
  - 运行中断网
  - 自动重连后继续会话
- Daemon 稳定性：
  - 多次 start 幂等
  - stale state / stale lock
  - 子进程退出清理
  - 版本漂移接管

## 16. 每阶段退出准则（Go/No-Go）

- Go 条件：
  - parity 全绿
  - 集成测试全绿
  - 新增代码覆盖到关键路径
- No-Go 条件：
  - 任一事件时序差异未解释
  - 任一命令退出码或错误文本差异未记录
  - Daemon 存在孤儿进程风险
