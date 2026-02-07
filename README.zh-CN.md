# anycodecli

[English](./README.md) | 简体中文

随时随地控制 AI 编码代理 — 支持 Claude、Codex 和 Gemini 的模块化命令行工具。

免费。开源。随处编码。

## 什么是 anycodecli？

`anycodecli` 是一个模块化的命令行界面，可以从移动设备或其他客户端远程控制 AI 编码代理（Claude、Codex、Gemini）。它提供：

- **远程会话控制** - 启动编码会话并从移动设备控制
- **多代理支持** - 支持 Claude Code、Codex 和 Gemini
- **实时同步** - 跨设备的会话状态同步
- **守护进程模式** - 后台服务管理多个会话
- **模块化架构** - 清晰的关注点分离，易于维护

## 安装

```bash
npm install
npm run build
```

## 快速开始

### 启动 Claude 会话

```bash
npm run dev -- claude
```

这将：
1. 启动 Claude Code 会话
2. 显示二维码以从移动设备连接
3. 在 Claude Code 和移动应用之间实现实时会话共享

### 启动 Gemini 会话

```bash
npm run dev -- gemini
```

**首次设置：**
```bash
# 使用 Google 进行身份验证
npm run dev -- connect gemini
```

### 启动 Codex 会话

```bash
npm run dev -- codex
```

## 命令

### 代理命令

- `anycodecli claude` - 启动 Claude Code 会话（默认）
- `anycodecli gemini` - 启动 Gemini CLI 会话
- `anycodecli codex` - 启动 Codex 模式

### 守护进程命令

- `anycodecli daemon start` - 启动后台守护进程
- `anycodecli daemon stop` - 停止后台守护进程
- `anycodecli daemon status` - 检查守护进程状态
- `anycodecli daemon list` - 列出活动会话
- `anycodecli daemon spawn-session <dir>` - 生成新会话
- `anycodecli daemon stop-session <id>` - 停止特定会话

### 实用命令

- `anycodecli auth login` - 管理身份验证
- `anycodecli connect <provider>` - 连接到 AI 提供商
- `anycodecli doctor` - 诊断问题
- `anycodecli notify` - 发送通知

## 架构

anycodecli 遵循清晰的模块化架构：

```
src/
├── app/              # 应用启动和路由
├── commands/         # 命令实现
├── domain/           # 业务逻辑和编排
│   ├── session/      # 会话管理
│   ├── daemon/       # 守护进程编排
│   └── machine/      # 机器注册
├── agents/           # AI 代理集成
│   ├── claude/       # Claude 运行时
│   ├── codex/        # Codex 运行时
│   ├── gemini/       # Gemini 运行时
│   └── acp/          # ACP 协议
├── infra/            # 基础设施层
│   ├── api/          # API 客户端
│   ├── rpc/          # RPC 处理
│   ├── persistence/  # 数据持久化
│   └── logging/      # 日志
└── compatibility/    # 兼容性层
```

### 核心设计原则

- **模块化** - 清晰的关注点分离
- **可测试** - 支持依赖注入和模拟
- **可扩展** - 易于添加新代理或功能
- **零行为漂移** - Legacy delegation 确保兼容性

## 开发

### 运行测试

```bash
npm test
```

### 类型检查

```bash
npm run typecheck
```

### 命名规范检查

```bash
npm run check-naming
```

### 完整 CI 流程

```bash
npm run ci
```

## 配置

### 环境变量

- `ANYCODECLI_SESSION_SYNC_MODE` - 会话同步模式（`legacy` 或 `noop`）
- `ANYCODECLI_LEGACY_ENTRY` - Legacy CLI 入口点路径

### 会话模式

- **本地模式** - 在本地运行代理
- **远程模式** - 连接到远程守护进程
- **守护进程模式** - 管理多个会话的后台服务

## 文档

完整文档位于 [`docs/`](./docs) 目录：

- **[REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md)** - 详细的重构计划和架构
- **[BASELINE_REPORT.md](./docs/BASELINE_REPORT.md)** - 基线行为报告
- **[CI_NAMING_GUARD.md](./docs/CI_NAMING_GUARD.md)** - CI 命名守卫文档
- **[INTERFACE_CONTRACTS.md](./docs/INTERFACE_CONTRACTS.md)** - 接口契约

查看 [docs/README.md](./docs/README.md) 获取完整文档导航。

## 项目状态

当前实现使用 **legacy delegation 策略**，以确保在重构过程中零行为漂移：

- ✅ 命令层已重构（路由器 + 模块 + 编排器）
- ✅ 会话核心已重构（pipeline/lifecycle/orchestrator）
- ✅ 守护进程核心已重构（编排结构）
- ✅ API 与同步层（契约已定义，类型已统一）
- ✅ 代理抽象（runtime/process/updates/permissions）
- ✅ 基础设施契约（RPC、持久化、日志、信号）
- ✅ 命名统一（所有地方都使用 `anycodecli`）
- ✅ CI 命名守卫（自动检查）

所有命令当前委托给 legacy runtime 以保持精确的行为，同时内部架构正在现代化。

## 测试

项目包含全面的测试覆盖：

- **18 个测试文件**，**79 个测试用例**
- 单个模块的单元测试
- 命令流程的集成测试
- 确保行为一致性的 Parity 测试
- 防止 legacy 命名的 CI 命名守卫

运行测试：

```bash
npm test
```

## 贡献

欢迎贡献！请：

1. 阅读 [REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md) 了解架构
2. 遵循现有的代码风格和模式
3. 为新功能添加测试
4. 确保所有 CI 检查通过（`npm run ci`）

## 许可证

MIT

## 相关项目

- **happy-cli** - 原始 CLI 实现
- **移动应用** - 用于远程控制的配套移动应用

## 链接

- **GitHub 仓库**：https://github.com/BOBBOB312/anycodecli
- **文档**：https://github.com/BOBBOB312/anycodecli/tree/main/docs
- **问题反馈**：https://github.com/BOBBOB312/anycodecli/issues
