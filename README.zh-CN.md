# anycodecli

[English](./README.md) | 简体中文

`anycodecli` 是一个模块化重构工作空间，旨在将现有 CLI 架构拆分为可替换、可测试、可演进的模块，同时保持零功能差异。

## 📋 项目概述

anycodecli 采用渐进式重构策略，通过 legacy delegation 机制确保在重构过程中行为完全一致。所有命令当前通过委托层转发到原始实现，保证零行为漂移。

### 核心特性

- ✅ **模块化架构** - 清晰的分层设计（app/commands/domain/agents/infra）
- ✅ **零行为差异** - 通过 legacy delegation 保证功能完全一致
- ✅ **类型安全** - TypeScript strict mode，完整的类型定义
- ✅ **测试覆盖** - 79 个测试用例，覆盖核心功能
- ✅ **CI/CD 集成** - 自动化测试、类型检查、命名规范检查
- ✅ **命名统一** - 统一使用 `anycodecli` 命名规范

## 🏗️ 架构设计

### 分层结构

```
anycodecli/
├── src/
│   ├── app/              # 应用层 - 启动、路由、依赖注入
│   ├── commands/         # 命令层 - 参数解析、命令处理
│   ├── domain/           # 领域层 - 业务逻辑、编排器
│   │   ├── session/      # 会话管理
│   │   ├── daemon/       # 守护进程管理
│   │   └── machine/      # 机器注册服务
│   ├── agents/           # Agent 层 - 供应商差异封装
│   │   ├── claude/       # Claude runtime
│   │   ├── codex/        # Codex runtime
│   │   ├── gemini/       # Gemini runtime
│   │   └── acp/          # ACP runtime
│   ├── infra/            # 基础设施层 - 外部依赖适配
│   │   ├── api/          # API 客户端、会话同步
│   │   ├── rpc/          # RPC 处理
│   │   ├── persistence/  # 持久化
│   │   ├── logging/      # 日志
│   │   └── process/      # 进程管理
│   └── compatibility/    # 兼容性层 - 行为验证
├── tests/                # 测试套件
├── docs/                 # 文档目录
└── scripts/              # 工具脚本
```

### 设计原则

1. **单一职责** - 每个模块只负责一个明确的功能
2. **依赖注入** - 运行时依赖可替换，便于测试
3. **接口契约** - 清晰的接口定义，统一的类型来源
4. **渐进迁移** - 通过 legacy delegation 逐步替换实现

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev -- --help
```

### 运行测试

```bash
# 运行所有测试
npm test

# 类型检查
npm run typecheck

# 命名规范检查
npm run check-naming

# 完整 CI 流程
npm run ci
```

### 构建

```bash
npm run build
```

## 📊 当前完成状态

### Phase 1-4 架构完成度

- ✅ **命令层重构** - 路由器 + 命令模块 + 编排器
- ✅ **会话核心重构** - 消息管道 / 生命周期 / 编排器
- ✅ **Daemon 核心重构** - 本地编排结构
- ✅ **API & 同步层** - 契约定义，类型统一
- ✅ **ACP Agent 抽象** - 运行时 / 进程 / 更新 / 权限契约
- ✅ **Daemon HTTP 层** - 控制服务器 / 客户端契约
- ✅ **基础设施契约** - RPC、持久化、日志、信号、机器注册
- ✅ **命名统一** - binary=`anycodecli`, env=`ANYCODECLI_*`, package=`anycodecli`

### 实现进度

| 模块 | 状态 | 说明 |
|------|------|------|
| 命令路由 | ✅ 完成 | 所有命令通过统一路由器分发 |
| 会话管理 | ✅ 完成 | SessionOrchestrator 编排会话生命周期 |
| Daemon 管理 | ✅ 完成 | DaemonOrchestrator 管理守护进程 |
| Agent 抽象 | ✅ 完成 | 统一的 AgentBackend 接口 |
| API 客户端 | ✅ 完成 | 契约定义，支持 legacy/noop 模式 |
| 测试覆盖 | ✅ 完成 | 18 个测试文件，79 个测试用例 |
| CI/CD | ✅ 完成 | GitHub Actions + 命名守卫 |

### 项目指标

- **源文件**: 59 个 TypeScript 文件
- **测试文件**: 18 个测试文件
- **测试用例**: 79 个（全部通过）
- **类型检查**: 通过（strict mode）
- **命名规范**: 0 个违规
- **代码行数**: 6600+ 行

## 🧪 测试策略

### 测试类型

1. **单元测试** - 测试独立模块功能
2. **集成测试** - 测试模块间协作
3. **Parity 测试** - 验证行为一致性
4. **命名守卫** - 自动检测旧命名残留

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- router.test.ts

# 查看测试覆盖率
npm test -- --coverage
```

## 📚 文档

完整文档位于 [`docs/`](./docs) 目录：

- **[REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md)** - 详细重构方案
- **[BASELINE_REPORT.md](./docs/BASELINE_REPORT.md)** - 基线报告
- **[CI_NAMING_GUARD.md](./docs/CI_NAMING_GUARD.md)** - CI 命名守卫文档
- **[INTERFACE_CONTRACTS.md](./docs/INTERFACE_CONTRACTS.md)** - 接口契约定义
- **[SUMMARY.md](./docs/SUMMARY.md)** - 任务完成总结

查看 [docs/README.md](./docs/README.md) 获取完整文档导航。

## 🔧 命名规范

项目统一使用 `anycodecli` 命名：

- **二进制名称**: `anycodecli`
- **环境变量前缀**: `ANYCODECLI_*`
- **数据目录**: `~/.anycodecli`
- **包名**: `anycodecli`

### 命名守卫

项目包含自动化命名守卫系统，防止旧命名残留：

```bash
npm run check-naming
```

守卫会检测以下违规模式：
- `HAPPY_` 环境变量前缀
- `happy.mjs` 二进制引用
- `happy-cli` 包名引用
- `~/.happy` 数据目录

详见 [CI_NAMING_GUARD.md](./docs/CI_NAMING_GUARD.md)。

## 🛠️ 开发指南

### 添加新命令

1. 在 `src/commands/` 创建命令模块
2. 实现 `CommandModule` 接口
3. 在 `command-router.ts` 注册命令
4. 添加对应测试

### 添加新 Agent

1. 在 `src/agents/` 创建 runtime 模块
2. 实现 `AgentBackend` 接口
3. 在 `legacy-runtime-factory.ts` 注册工厂
4. 添加对应测试

### 代码规范

- 单文件不超过 350 行（特殊情况需说明）
- 运行时层不允许直接 `process.exit`
- 协议对象必须有 schema 与类型双重定义
- 禁止同一概念多处定义

## 🔄 兼容性策略

### Legacy Delegation

当前阶段采用 legacy delegation 策略：

- 所有命令最终委托给原始实现执行
- 保证零行为差异
- 允许渐进式迁移内部实现

### 环境变量

支持配置会话同步模式：

```bash
# Legacy 模式（默认）
ANYCODECLI_SESSION_SYNC_MODE=legacy

# Noop 模式（测试/离线）
ANYCODECLI_SESSION_SYNC_MODE=noop
```

## 🚦 CI/CD

### GitHub Actions

项目配置了完整的 CI 流程（`.github/workflows/ci.yml`）：

1. **类型检查** - TypeScript strict mode
2. **测试** - 运行所有测试用例
3. **命名检查** - 检测旧命名残留
4. **构建** - 验证构建成功

### 本地 CI

运行完整 CI 流程：

```bash
npm run ci
```

## 📈 下一步计划

根据 [BASELINE_REPORT.md](./docs/BASELINE_REPORT.md) 的 Follow-up actions：

1. **逐步替换 legacy delegation** - 从低风险模块开始
2. **补充 E2E 集成测试** - 需要真实环境
3. **性能优化** - 减少启动开销
4. **文档完善** - 补充 API 文档和示例

## 🤝 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交前检查

确保所有检查通过：

```bash
npm run ci
```

### 代码审查

- 遵循现有代码风格
- 添加必要的测试
- 更新相关文档
- 确保 CI 通过

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/BOBBOB312/anycodecli
- **文档目录**: https://github.com/BOBBOB312/anycodecli/tree/main/docs
- **问题反馈**: https://github.com/BOBBOB312/anycodecli/issues

## 📞 联系方式

如有问题或建议，欢迎：

- 提交 [Issue](https://github.com/BOBBOB312/anycodecli/issues)
- 创建 [Pull Request](https://github.com/BOBBOB312/anycodecli/pulls)
- 查看 [文档](./docs)

---

**注意**: 本项目当前处于重构阶段，通过 legacy delegation 保证行为一致性。随着重构进展，将逐步替换为原生实现。
