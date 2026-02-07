# anycodecli 文档目录

本目录包含 anycodecli 项目的所有文档。

## 核心文档

### 重构与架构
- **[REFACTOR_PLAN.md](./REFACTOR_PLAN.md)** - 详细重构方案（模块化 + 零功能差异）
- **[REFACTOR_EXECUTION_PLAYBOOK.md](./REFACTOR_EXECUTION_PLAYBOOK.md)** - 重构执行手册
- **[INTERFACE_CONTRACTS.md](./INTERFACE_CONTRACTS.md)** - 接口契约定义

### 基线与验收
- **[BASELINE_REPORT.md](./BASELINE_REPORT.md)** - 基线报告（冻结重构前行为）
- **[MIGRATION_SIGNOFF.md](./MIGRATION_SIGNOFF.md)** - 迁移签收文档

### 实施清单
- **[FILE_MIGRATION_CHECKLIST.md](./FILE_MIGRATION_CHECKLIST.md)** - 文件迁移检查清单

### CI/CD
- **[CI_NAMING_GUARD.md](./CI_NAMING_GUARD.md)** - CI 命名守卫文档

### 总结
- **[SUMMARY.md](./SUMMARY.md)** - 任务完成总结

## 文档导航

### 如果你想了解...

**项目架构和重构计划**
→ 阅读 [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)

**当前项目状态和基线数据**
→ 阅读 [BASELINE_REPORT.md](./BASELINE_REPORT.md)

**如何使用命名守卫**
→ 阅读 [CI_NAMING_GUARD.md](./CI_NAMING_GUARD.md)

**接口和契约定义**
→ 阅读 [INTERFACE_CONTRACTS.md](./INTERFACE_CONTRACTS.md)

**最新完成的工作**
→ 阅读 [SUMMARY.md](./SUMMARY.md)

## 项目概览

anycodecli 是一个模块化重构项目，目标是在保持零功能差异的前提下，将架构拆分为可替换、可测试、可演进的模块。

### 当前状态
- ✅ 59 个源文件
- ✅ 18 个测试文件，79 个测试用例（全部通过）
- ✅ TypeScript strict mode 类型检查通过
- ✅ 命名规范检查通过（0 个违规）
- ✅ Phase 1-4 所有批次（A-F）架构文件就位

### 命名规范
- 二进制名：`anycodecli`
- 环境变量前缀：`ANYCODECLI_`
- 数据目录：`~/.anycodecli`
- 包名：`anycodecli`

## 快速开始

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 类型检查
npm run typecheck

# 命名检查
npm run check-naming

# 完整 CI 流程
npm run ci

# 开发模式
npm run dev -- --help
```

## 贡献指南

在修改代码前，请阅读：
1. [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) - 了解架构设计
2. [INTERFACE_CONTRACTS.md](./INTERFACE_CONTRACTS.md) - 了解接口契约
3. [CI_NAMING_GUARD.md](./CI_NAMING_GUARD.md) - 了解命名规范

确保所有检查通过：
```bash
npm run ci
```
