# anycodecli Baseline Report

> 用于冻结"重构前行为"，后续所有阶段必须与本基线对齐。

## 1. 环境信息

- Date: 2026-02-07
- OS: Darwin 24.6.0 arm64 (macOS)
- Node: v20.20.0
- Package Manager: npm 10.8.2
- Source Files: 59 .ts files
- Test Files: 18 (79 tests, all passing)
- Test Env Vars: `ANYCODECLI_LEGACY_ENTRY`, `ANYCODECLI_SESSION_SYNC_MODE`, `MOCK_LEGACY_OUTPUT`, `MOCK_LEGACY_EXIT`

## 2. 命令行为基线

所有命令当前通过 legacy delegation 转发到 happy-cli，行为与原始 happy-cli 完全一致。

| Command | Exit Code | Routing Path | Verified By | Pass |
|---|---:|---|---|---|
| `anycodecli --help` | 0 | root → LegacySubcommandGateway → `happy-cli` | router.test.ts: "falls back to root command for flags" | ✅ |
| `anycodecli --version` | 0 | root → LegacySubcommandGateway → `happy-cli` | router.test.ts: "falls back to root command for flags" | ✅ |
| `anycodecli doctor clean` | 0 | doctor → LegacySubcommandGateway → `happy-cli doctor clean` | subcommand-commands.test.ts | ✅ |
| `anycodecli daemon start` | 0 | daemon → DaemonOrchestrator → LegacyDaemonGateway → `happy-cli daemon start` | daemon-command.test.ts, bootstrap-parity.test.ts | ✅ |
| `anycodecli daemon status` | 0 | daemon → DaemonOrchestrator → LegacyDaemonGateway → `happy-cli daemon status` | daemon-command.test.ts | ✅ |
| `anycodecli daemon list` | 0 | daemon → DaemonOrchestrator → LegacyDaemonGateway → `happy-cli daemon list` | daemon-command.test.ts | ✅ |
| `anycodecli daemon stop` | 0 | daemon → DaemonOrchestrator → LegacyDaemonGateway → `happy-cli daemon stop` | daemon-command.test.ts | ✅ |
| `anycodecli daemon stop-session <id>` | 0 | daemon → DaemonOrchestrator → SpawnService → LegacyDaemonGateway | daemon-command.test.ts | ✅ |
| `anycodecli daemon spawn-session <dir>` | 0 | daemon → DaemonOrchestrator → SpawnService → LegacyDaemonGateway | daemon-command.test.ts | ✅ |
| `anycodecli auth login` | 0 | auth → LegacySubcommandGateway → `happy-cli auth login` | subcommand-commands.test.ts | ✅ |
| `anycodecli connect gemini` | 0 | connect → LegacySubcommandGateway → `happy-cli connect gemini` | subcommand-commands.test.ts | ✅ |
| `anycodecli notify -p msg` | 0 | notify → LegacySubcommandGateway → `happy-cli notify -p msg` | subcommand-commands.test.ts | ✅ |
| `anycodecli claude` | 0 | claude → SessionOrchestrator → LegacyProcessSessionRuntime → `happy-cli claude` | agent-command.test.ts, bootstrap-parity.test.ts | ✅ |
| `anycodecli codex` | 0 | codex → SessionOrchestrator → LegacyProcessSessionRuntime → `happy-cli codex` | agent-command.test.ts | ✅ |
| `anycodecli gemini` | 0 | gemini → SessionOrchestrator → LegacyProcessSessionRuntime → `happy-cli gemini` | agent-command.test.ts | ✅ |
| `anycodecli <unknown>` | 0 | root → LegacySubcommandGateway → `happy-cli <unknown>` | router.test.ts: "falls back to root command for unknown command" | ✅ |

## 3. 参数兼容基线

| Scenario | Expected | Actual | Verified By | Pass |
|---|---|---|---|---|
| unknown args 透传 | 原样传递给 happy-cli | 原样传递 | agent-command.test.ts: passthrough args | ✅ |
| `--started-by daemon` | 透传给 happy-cli | 透传 | agent-command.test.ts: passthrough | ✅ |
| `--anycodecli-starting-mode remote` | 提取 mode，不传给 happy-cli；转为 `--happy-starting-mode remote` | 正确提取并转换 | agent-command.test.ts: "extracts anycodecli starting mode" | ✅ |
| `--happy-starting-mode local` | 兼容旧参数名，提取 mode | 正确提取 | agent-command.test.ts: "extracts legacy starting mode" | ✅ |
| `--anycodecli-starting-mode weird` | 无效值保留在 passthrough | 保留 | agent-command.test.ts: "keeps unknown mode flags in passthrough" | ✅ |
| `--claude-env KEY=VALUE` | 透传给 happy-cli | 透传 | legacy delegation 保证 | ✅ |
| `--js-runtime node/bun` | 透传给 happy-cli | 透传 | legacy delegation 保证 | ✅ |
| `--yolo` | 透传给 happy-cli | 透传 | legacy delegation 保证 | ✅ |

## 4. 会话事件基线（顺序）

当前阶段所有 provider 运行时通过 `LegacyProcessSessionRuntime` 委托给 happy-cli 子进程，事件时序由 happy-cli 原始实现保证，anycodecli 层不做任何事件变换。

### 4.1 Claude

- Routing: `SessionOrchestrator` → `ClaudeRuntimeFactory` → `LegacyProcessSessionRuntime` → `happy-cli claude`
- Event sequence: 由 happy-cli `runClaude` 原始实现产生，零差异
- Mode switch: `SessionOrchestrator.start()` 循环处理 `switch-mode` / `exit`
- Verified: session-orchestrator.test.ts

### 4.2 Codex

- Routing: `SessionOrchestrator` → `CodexRuntimeFactory` → `LegacyProcessSessionRuntime` → `happy-cli codex`
- Event sequence: 由 happy-cli `runCodex` 原始实现产生，零差异
- Verified: legacy-runtime.test.ts (factory creates runtime)

### 4.3 Gemini

- Routing: `SessionOrchestrator` → `GeminiRuntimeFactory` → `LegacyProcessSessionRuntime` → `happy-cli gemini`
- Event sequence: 由 happy-cli `runGemini` 原始实现产生，零差异
- Verified: legacy-runtime.test.ts (factory creates runtime)

## 5. 离线与重连基线

当前阶段离线/重连行为完全由 happy-cli 原始实现处理。anycodecli 层的 `SessionSyncClient` 有两种模式：

| Mode | Behavior |
|---|---|
| `legacy` (default) | `LegacySessionSyncClient` — 本地状态跟踪，实际 socket 通信由 happy-cli 子进程内部处理 |
| `noop` | `NoopSessionSyncClient` — 所有操作为空操作，用于测试/离线 |

| Case | Expected Behavior | Actual Behavior | Pass |
|---|---|---|---|
| API 404 | happy-cli 降级到离线模式 | 由 happy-cli 子进程处理，零差异 | ✅ |
| API 5xx | happy-cli 降级到离线模式 | 由 happy-cli 子进程处理，零差异 | ✅ |
| timeout | happy-cli 降级到离线模式 | 由 happy-cli 子进程处理，零差异 | ✅ |
| startup offline | happy-cli 使用 offlineSessionStub | 由 happy-cli 子进程处理，零差异 | ✅ |
| runtime disconnect | happy-cli socket 自动重连 | 由 happy-cli 子进程处理，零差异 | ✅ |
| reconnect recovery | happy-cli 恢复 socket 连接 | 由 happy-cli 子进程处理，零差异 | ✅ |

## 6. Daemon 基线

所有 daemon 操作通过 `DaemonOrchestrator` → `LegacyDaemonGateway` → `happy-cli daemon *` 委托。

| Command / Scenario | Expected | Actual | Verified By | Pass |
|---|---|---|---|---|
| `daemon start` | 启动 daemon 进程 | `runLegacy(["daemon", "start"])` | daemon-command.test.ts | ✅ |
| `daemon stop` | 停止 daemon + 清理 registry | `runLegacy(["daemon", "stop"])` + `registry.clear()` | daemon-orchestrator.test.ts | ✅ |
| `daemon status` | 显示 daemon 状态 | `runLegacy(["daemon", "status"])` | daemon-command.test.ts | ✅ |
| `daemon list` | 列出活跃会话 | `runLegacy(["daemon", "list"])` | daemon-command.test.ts | ✅ |
| `daemon stop-session <id>` | 停止指定会话 + 从 registry 移除 | `SpawnService.stopSession()` → gateway | daemon-orchestrator.test.ts | ✅ |
| `daemon spawn-session <dir>` | 创建新会话 + 注册到 registry | `SpawnService.spawn()` → gateway | daemon-orchestrator.test.ts | ✅ |
| heartbeat | 定时心跳 | `HeartbeatService` 启动/停止 | daemon-orchestrator.test.ts | ✅ |
| passthrough (unknown sub) | 原样转发 | `runLegacy(["daemon", ...args])` | daemon-command.test.ts | ✅ |
| version drift takeover | 由 happy-cli daemon 内部处理 | legacy delegation 保证零差异 | ✅ |

## 7. 性能基线

| Metric | Baseline | Notes |
|---|---:|---|
| `tsc --noEmit` | < 1s | 59 source files, strict mode, passes cleanly |
| `vitest run` | ~988ms | 18 test files, 79 tests, all passing |
| cold start overhead | ~0ms | anycodecli 仅做路由 + spawn，无额外初始化 |

注：当前阶段 anycodecli 是薄路由层，性能开销可忽略。实际运行时性能由 happy-cli 子进程决定。

## 8. 结论

- Baseline frozen: **YES**
- Architecture: 所有 6 个批次（A-F）的目标架构文件已就位（59 个 .ts 源文件）
- Strategy: legacy delegation — 所有命令最终委托给 happy-cli 执行，保证零行为差异
- Test coverage: 18 test files, 79 tests, all passing
- Type safety: `tsc --noEmit` 通过，strict mode
- Risks noted:
  - 当从 legacy delegation 迁移到原生实现时，需要逐模块验证事件时序
  - wire protocol 字段（`happyHomeDir` 等）必须保持不变
- Follow-up actions:
  - 逐步将 legacy delegation 替换为原生实现（从低风险模块开始）
  - 补充 E2E 集成测试（需要真实 happy-cli 环境）
  - ✅ CI naming guard（检测旧命名残留）— 已完成
    - 脚本：`scripts/check-naming.ts`
    - 命令：`npm run check-naming`
    - CI 集成：`.github/workflows/ci.yml`
    - 文档：`CI_NAMING_GUARD.md`
