# Scripts Directory

This directory contains utility scripts for the anycodecli project.

## Available Scripts

### check-naming.ts

CI 命名守卫脚本 - 检测代码中是否残留旧的 happy-cli 命名。

**用途：**
- 确保所有代码遵循 anycodecli 命名规范
- 防止旧命名（happy-cli）残留在代码库中
- 在 CI 流程中自动运行

**运行：**
```bash
npm run check-naming
```

**详细文档：** 参见 [CI_NAMING_GUARD.md](../CI_NAMING_GUARD.md)

## 添加新脚本

当添加新的脚本时：

1. 在此目录创建 `.ts` 或 `.js` 文件
2. 在 `package.json` 的 `scripts` 部分添加对应命令
3. 更新本 README 文档
4. 如果脚本用于 CI，更新 `.github/workflows/ci.yml`
