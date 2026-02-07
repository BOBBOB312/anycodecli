# anycodecli File Migration Checklist

> 逐文件迁移清单，建议按顺序执行并在每一项完成后立即跑回归。

## Batch A - CLI 入口与命令

| Source | Target | Action | Done |
|---|---|---|---|
| `src/index.ts` | `src/app/bootstrap.ts` | 启动流程、统一错误边界、统一退出码 | [x] |
| `src/index.ts` | `src/app/command-router.ts` | 命令分发 | [x] |
| `src/index.ts` | `src/commands/daemon/command.ts` | daemon 子命令实现 | [x] |
| `src/index.ts` | `src/commands/notify/command.ts` | notify 子命令实现 | [x] |
| `src/commands/auth/*` | `src/commands/auth/*` | 保持逻辑，清理依赖方向 | [x] |
| `src/commands/connect/*` | `src/commands/connect/*` | 保持逻辑，清理依赖方向 | [x] |

## Batch B - API 与同步

| Source | Target | Action | Done |
|---|---|---|---|
| `src/api/api.ts` | `src/infra/api/api-client.ts` | HTTP + encryption 封装 | [x] |
| `src/api/apiSession.ts` | `src/infra/api/session-sync-client.ts` | socket update/rpc/message | [x] |
| `src/api/apiMachine.ts` | `src/infra/api/machine-sync-client.ts` | machine sync | [x] |
| `src/api/types.ts` | `src/infra/api/types.ts` | schema 与 type 收敛 | [x] |

## Batch C - 会话内核与运行时

| Source | Target | Action | Done |
|---|---|---|---|
| `src/claude/runClaude.ts` | `src/agents/claude/claude-runtime.ts` | Claude provider 差异层 | [x] |
| `src/codex/runCodex.ts` | `src/agents/codex/codex-runtime.ts` | Codex provider 差异层 | [x] |
| `src/gemini/runGemini.ts` | `src/agents/gemini/gemini-runtime.ts` | Gemini provider 差异层 | [x] |
| `src/claude/loop.ts` | `src/domain/session/session-orchestrator.ts` | 模式切换状态机 | [x] |
| `src/claude/session.ts` | `src/domain/session/session-lifecycle.ts` | keepAlive/cleanup/metadata 更新 | [x] |
| `src/utils/MessageQueue2.ts` | `src/domain/session/message-pipeline.ts` | 队列语义抽象 | [x] |

## Batch D - ACP 与 Agent 抽象

| Source | Target | Action | Done |
|---|---|---|---|
| `src/agent/acp/AcpBackend.ts` | `src/agents/acp/acp-runtime.ts` | 运行时编排 | [x] |
| `src/agent/acp/AcpBackend.ts` | `src/agents/acp/acp-process.ts` | 进程生命周期 | [x] |
| `src/agent/acp/sessionUpdateHandlers.ts` | `src/agents/acp/acp-session-updates.ts` | update 分发 | [x] |
| `src/agent/acp/AcpBackend.ts` | `src/agents/acp/acp-permissions.ts` | permission 管线 | [x] |
| `src/agent/core/AgentBackend.ts` + `src/agent/core/AgentMessage.ts` | `src/agents/contracts/*` | 去重统一单一来源 | [x] |

## Batch E - Daemon

| Source | Target | Action | Done |
|---|---|---|---|
| `src/daemon/run.ts` | `src/domain/daemon/daemon-orchestrator.ts` | 生命周期主流程 | [x] |
| `src/daemon/run.ts` | `src/domain/daemon/spawn-service.ts` | spawn/tmux/env merge | [x] |
| `src/daemon/run.ts` | `src/domain/daemon/child-registry.ts` | pid/session 跟踪 | [x] |
| `src/daemon/run.ts` | `src/domain/daemon/heartbeat-service.ts` | 心跳与版本漂移 | [x] |
| `src/daemon/controlServer.ts` | `src/infra/daemon-http/control-server.ts` | HTTP 路由 + schema | [x] |
| `src/daemon/controlClient.ts` | `src/infra/daemon-http/control-client.ts` | daemon 调用客户端 | [x] |

## Batch F - 命名迁移与清理

| Item | Requirement | Done |
|---|---|---|
| binary name | `anycodecli` | [x] |
| data dir prefix | `~/.anycodecli` | [x] |
| env prefix | `ANYCODECLI_` | [x] |
| docs/examples | 全部命令示例统一 | [x] |
| CI naming guard | 旧命名命中即失败 | [ ] |

## 每批次完成后的固定动作

1. 运行 parity tests
2. 运行 integration tests
3. 运行 smoke tests（关键命令）
4. 更新 `MIGRATION_SIGNOFF.md`
