# anycodecli Migration Signoff

> 用于每个阶段结束后的验收签字，确保“零功能差异”落地。

## 1. 阶段信息

- Phase: A-F (架构重构与兼容性验证)
- Owner: AI Assistant + User
- Date: 2026-02-07
- Branch: N/A (local workspace, no git metadata)
- Commit SHA: N/A (local workspace, no git metadata)

## 2. 验收摘要

| Area | Result | Evidence |
|---|---|---|
| Command parity | PASS | `tests/parity-commands.test.ts` (22 tests) + `tests/bootstrap-parity.test.ts` |
| Session lifecycle parity | PASS | `tests/session-orchestrator.test.ts`, `tests/session-lifecycle.test.ts`, `tests/agent-command.test.ts` |
| Daemon parity | PASS | `tests/daemon-command.test.ts`, `tests/daemon-orchestrator.test.ts`, `tests/integration.test.ts` |
| Protocol parity (RPC/events) | PASS | `tests/infra-contracts.test.ts`, `tests/acp-modules.test.ts`, session sync tests |
| Naming policy (`anycodecli`) | PASS | `npm run check-naming`, `.github/workflows/ci.yml` naming step |

## 3. 强制检查项

- [x] 所有单元测试通过
- [x] 所有集成测试通过
- [x] parity/golden 测试通过
- [x] 关键路径事件时序无差异
- [x] 关键命令退出码无差异
- [x] 无新增孤儿进程/泄漏
- [x] 无旧命名残留（代码/文档/脚本）

## 4. 变更清单

| File/Module | Change Type | Compatibility Risk | Status |
|---|---|---|---|
| `src/app/*` | 拆分 bootstrap/router/context 工厂 | 低 | Completed |
| `src/commands/*` | 命令层模块化 + domain 编排接入 | 中 | Completed |
| `src/domain/session/*` | 队列/生命周期/编排器重构 | 中 | Completed |
| `src/domain/daemon/*` | daemon orchestrator + services 拆分 | 中 | Completed |
| `src/domain/subcommand/*` | 非 agent 命令统一编排 | 低 | Completed |
| `src/agents/*` | runtime/contracts/acp 契约收敛 | 中 | Completed |
| `src/infra/*` | API/daemon-http/rpc/persistence/logging/process 契约落地 | 中 | Completed |
| `tests/*` | parity + integration + contract 全量覆盖 | 低 | Completed |

## 5. 差异说明（如有）

> 如果存在“可接受差异”，必须写清理由、影响范围、回滚策略。

- Diff 1:
- Diff 2:

无可接受差异。当前策略为 legacy delegation + 新架构编排，保持运行行为与 legacy 实现一致。

## 6. 风险复核

- [x] 事件时序风险已复测
- [x] Daemon 竞态风险已复测
- [x] 权限请求 ID 映射风险已复测
- [x] 离线重连风险已复测

## 7. 回滚预案

- Rollback trigger: 任一 parity/integration 测试失败，或命令退出码/事件序列差异
- Rollback method: 继续使用 legacy delegation 路径（当前默认），禁用新增原生路径
- Data safety check: 不变更外部存储协议；命名守卫与测试通过后再发布

## 8. 签字

- Tech Lead: Pending human sign-off
- QA: Pending human sign-off
- Release Owner: Pending human sign-off
- Final Decision: `GO` (automated checks green, pending manual sign-off)
