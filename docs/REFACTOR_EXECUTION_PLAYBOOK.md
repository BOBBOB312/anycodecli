# anycodecli Refactor Execution Playbook

> 给实施人员的“每天可执行”版本，减少重构偏航。

## 1. 每日工作流

1. 从 `FILE_MIGRATION_CHECKLIST.md` 选一个最小批次任务。
2. 只改一个模块边界，不跨层混改。
3. 完成后立即执行：
   - parity tests
   - integration tests
   - smoke commands
4. 更新 `MIGRATION_SIGNOFF.md`。
5. 若出现行为差异，先补测试再修实现。

## 2. 提交粒度要求

- 单次提交只包含一个主题：
  - 入口拆分
  - 会话内核抽象
  - daemon 拆分
  - 命名统一
- 避免“功能 + 重命名 + 格式化”混在一个提交中。

## 3. 建议分支策略

- `refactor/phase-1-router`
- `refactor/phase-2-session-core`
- `refactor/phase-3-agent-runtime`
- `refactor/phase-4-daemon`
- `refactor/phase-5-infra`
- `refactor/phase-6-naming-cleanup`

## 4. 每阶段完成定义

### 阶段 1 完成定义

- 命令分发完成模块化。
- `anycodecli --help` 与相关子命令输出一致。

### 阶段 2 完成定义

- 会话生命周期统一到 orchestrator。
- 三类 provider 的 abort/kill/ready 时序一致。

### 阶段 3 完成定义

- `AgentMessage` 单一来源。
- Provider runtime 均通过统一 backend 接口暴露。

### 阶段 4 完成定义

- daemon 分层落地。
- 无孤儿进程，无重复实例。

### 阶段 5 完成定义

- API、sync、persistence 分层完成。
- 离线重连行为一致。

### 阶段 6 完成定义

- 命名统一为 `anycodecli`。
- CI 命名守卫开启并通过。

## 5. 快速排错优先级

1. 先看退出码是否变化。
2. 再看事件顺序是否变化。
3. 再看错误文案语义是否变化。
4. 最后看性能是否回退。

## 6. 不可做事项

- 不在重构阶段新增用户可见功能。
- 不在同一批次重写协议。
- 不跳过 parity 直接合并。
- 不在未签收阶段删除旧实现。

## 7. 合并前检查清单

- [ ] parity tests 通过
- [ ] integration tests 通过
- [ ] smoke tests 通过
- [ ] 文档已更新
- [ ] `MIGRATION_SIGNOFF.md` 已填写
