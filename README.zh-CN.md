# anycodecli

[English](./README.md) | 简体中文

`anycodecli` 是一个模块化重构工作空间。

## 当前实现状态

- Phase 1 脚手架已实现
- CLI 启动和命令路由已拆分为独立模块
- 每个命令当前委托给 legacy runtime 以保持行为一致
- Phase 2 核心模块已搭建：
  - `domain/session/message-pipeline.ts`
  - `domain/session/session-lifecycle.ts`
  - `domain/session/session-orchestrator.ts`
  - `domain/session/readiness-policy.ts`
  - `infra/api/session-sync-client.ts`
- Phase 3 运行时基础已搭建：
  - `agents/contracts/agent-message.ts`（消息类型的单一来源）
  - `agents/contracts/agent-backend.ts`
  - `agents/contracts/permission-handler.ts`
  - `agents/shared/legacy-process-session-runtime.ts`
  - `agents/claude|codex|gemini/*-runtime.ts`
  - `domain/session/legacy-runtime-factory.ts`
- Phase 4 (Batch B) API 与同步层契约：
  - `infra/api/types.ts`（统一的 API 类型定义）
  - `infra/api/api-client.ts`（API 客户端接口）
  - `infra/api/machine-sync-client.ts`（机器同步契约）
- Phase 4 (Batch D) ACP 与 Agent 抽象：
  - `agents/acp/acp-runtime.ts`（ACP 运行时工厂）
  - `agents/acp/acp-process.ts`（ACP 进程生命周期）
  - `agents/acp/acp-session-updates.ts`（会话更新分发）
  - `agents/acp/acp-permissions.ts`（权限管道）
- Phase 4 (Batch E) Daemon HTTP 层：
  - `infra/daemon-http/control-server.ts`（HTTP 控制服务器契约）
  - `infra/daemon-http/control-client.ts`（HTTP 控制客户端契约）
- 基础设施契约：
  - `infra/rpc/rpc-handler-registry.ts`（RPC 处理器注册表）
  - `infra/persistence/persistence.ts`（凭证、守护进程状态、设置）
  - `infra/logging/logger.ts`（日志契约）
  - `infra/process/signal-manager.ts`（集中式信号处理）
  - `domain/machine/machine-service.ts`（机器注册）
- 兼容性层：
  - `compatibility/cli-parity/parity-check.ts`
- Agent 命令（`claude/codex/gemini`）现在通过 `SessionOrchestrator` 运行，
  同时仍在底层执行 legacy provider 进程
- 命令上下文现在对 `ProcessSpawner` 和 `SessionSyncClientFactory` 使用依赖注入，
  因此运行时依赖是可替换的
- Daemon 命令现在通过 `domain/daemon/daemon-orchestrator.ts` 
  和 `domain/daemon/legacy-daemon-gateway.ts` 路由
- Daemon 内部已拆分为可复用的服务：
  - `domain/daemon/child-registry.ts`
  - `domain/daemon/spawn-service.ts`
  - `domain/daemon/heartbeat-service.ts`
- 会话同步现在支持通过 `ANYCODECLI_SESSION_SYNC_MODE=legacy|noop` 配置模式
- 非 agent 命令现在通过领域编排器/网关路由
  （`domain/subcommand/*`、`domain/daemon/*`），而不是直接的命令级委托
- Bootstrap 现在通过 `src/app/context-factory.ts` 组装依赖，使应用程序组装显式化

## 当前完成状态

- 命令层重构：已完成（路由器 + 命令模块 + 编排器）
- 会话核心重构：已完成内部抽象（`pipeline/lifecycle/orchestrator`）
- Daemon 核心重构：已完成本地编排结构
- API 与同步层：已完成（契约已定义，类型已统一）
- ACP agent 抽象：已完成（runtime/process/updates/permissions 契约）
- Daemon HTTP 层：已完成（control-server/control-client 契约）
- 基础设施契约：已完成（RPC、持久化、日志、信号、机器）
- 命名迁移：binary=`anycodecli`，env=`ANYCODECLI_*`，package=`anycodecli`
- 兼容性策略：仍使用 legacy runtime 执行桥接以实现零行为漂移

这在实现零行为漂移的同时，支持内部的渐进式迁移。

## 运行

```bash
npm install
npm run dev -- --help
```

## 测试

```bash
npm test
```

## 文档

完整文档请查看 [`docs/`](./docs) 目录：

- **[REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md)** - 详细重构方案
- **[BASELINE_REPORT.md](./docs/BASELINE_REPORT.md)** - 基线报告
- **[CI_NAMING_GUARD.md](./docs/CI_NAMING_GUARD.md)** - CI 命名守卫文档
- **[INTERFACE_CONTRACTS.md](./docs/INTERFACE_CONTRACTS.md)** - 接口契约定义

查看 [docs/README.md](./docs/README.md) 获取完整文档导航。
