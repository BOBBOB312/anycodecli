# CI 命名守卫文档

## 概述

CI 命名守卫是一个自动化检测工具，用于确保代码库中不会残留旧的 `happy-cli` 命名，保证所有代码遵循 `anycodecli` 命名规范。

## 命名规范

根据 REFACTOR_PLAN.md 第 12 节的要求：

- **二进制名**：`anycodecli`
- **数据目录前缀**：`~/.anycodecli`
- **环境变量前缀**：`ANYCODECLI_`
- **包名**：`anycodecli`

## 检测的违规模式

命名守卫会检测以下旧命名模式：

1. **`HAPPY_` 环境变量前缀**
   - 例如：`HAPPY_HOME_DIR`, `HAPPY_API_KEY`
   - 应改为：`ANYCODECLI_HOME_DIR`, `ANYCODECLI_API_KEY`

2. **`happy.mjs` 二进制引用**
   - 例如：直接引用 `happy.mjs`
   - 应改为：`anycodecli.mjs` 或通过 legacy-entry 委托

3. **`happy-cli` 包名引用**
   - 例如：`import from 'happy-cli'`
   - 应改为：`anycodecli` 或通过 legacy delegation

4. **`~/.happy` 数据目录**
   - 例如：`~/.happy/config`
   - 应改为：`~/.anycodecli/config`

## 允许的例外

以下情况是允许的，不会被标记为违规：

### 1. Wire Protocol 字段
```typescript
// ✅ 允许 - 必须保持协议兼容性
interface SessionMetadata {
  happyHomeDir: string;  // wire protocol 字段
}
```

### 2. 兼容性参数
```typescript
// ✅ 允许 - 向后兼容
if (arg === "--happy-starting-mode") {
  // 处理旧参数
}
```

### 3. 注释中的说明
```typescript
// ✅ 允许 - 说明迁移来源
/**
 * Mirrors happy-cli's logger interface
 */
```

### 4. Legacy Entry 引用
```typescript
// ✅ 允许 - 在 legacy-entry.ts 中
const legacyPath = "../happy-cli/bin/happy.mjs";
```

### 5. 测试文件中的引用
```typescript
// ✅ 允许 - 在 *.test.ts 中
const mockLegacyEntry = "happy-cli";
```

## 使用方法

### 本地运行

```bash
# 仅运行命名检查
npm run check-naming

# 运行完整 CI 流程（类型检查 + 测试 + 命名检查）
npm run ci
```

### CI/CD 集成

命名守卫已集成到 GitHub Actions CI 流程中（`.github/workflows/ci.yml`）：

```yaml
- name: Check naming conventions
  run: npm run check-naming
```

每次 push 或 pull request 时都会自动运行。

## 输出示例

### 成功（无违规）
```
🔍 Scanning for legacy naming violations...

Files scanned: 78

✅ No legacy naming violations found!

All code follows anycodecli naming conventions:
  - Binary: anycodecli
  - Env prefix: ANYCODECLI_
  - Data dir: ~/.anycodecli
```

### 失败（发现违规）
```
🔍 Scanning for legacy naming violations...

Files scanned: 78

❌ Found 2 naming violation(s):

📁 src/commands/example/command.ts
  15:10 - [HAPPY_ env prefix] "HAPPY_API_KEY"
    const apiKey = process.env.HAPPY_API_KEY;
  
📁 src/utils/config.ts
  42:25 - [~/.happy data directory] "~/.happy"
    const configPath = path.join("~/.happy", "config.json");

⚠️  Please update these references to use 'anycodecli' naming.
```

## 修复违规

如果检测到违规，请按以下步骤修复：

1. **环境变量**：将 `HAPPY_*` 改为 `ANYCODECLI_*`
   ```typescript
   // ❌ 错误
   const homeDir = process.env.HAPPY_HOME_DIR;
   
   // ✅ 正确
   const homeDir = process.env.ANYCODECLI_HOME_DIR;
   ```

2. **数据目录**：将 `~/.happy` 改为 `~/.anycodecli`
   ```typescript
   // ❌ 错误
   const configDir = "~/.happy";
   
   // ✅ 正确
   const configDir = "~/.anycodecli";
   ```

3. **二进制引用**：通过 legacy-entry 委托
   ```typescript
   // ❌ 错误
   spawn("happy.mjs", args);
   
   // ✅ 正确
   import { getLegacyEntryPath } from "./infra/process/legacy-entry";
   spawn(getLegacyEntryPath(), args);
   ```

## 扩展检测规则

如需添加新的检测规则，编辑 `scripts/check-naming.ts` 中的 `FORBIDDEN_PATTERNS` 数组：

```typescript
const FORBIDDEN_PATTERNS = [
  {
    name: "规则名称",
    regex: /匹配模式/g,
    exceptions: [
      /例外模式1/,
      /例外模式2/,
    ],
  },
  // ... 更多规则
];
```

## 技术细节

- **实现**：`scripts/check-naming.ts`
- **扫描范围**：`src/` 和 `tests/` 目录下的所有 `.ts`, `.js`, `.mjs` 文件
- **跳过文件**：`node_modules/`, `.git/`, `dist/`, `*.md`, `package.json` 等
- **退出码**：
  - `0`：无违规
  - `1`：发现违规

## 维护建议

1. **定期审查例外规则**：确保例外规则仍然必要
2. **更新检测模式**：随着重构进展，可能需要添加新的检测规则
3. **文档同步**：保持本文档与实际检测规则同步

## 相关文档

- [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) - 重构计划（第 12 节：命名治理要求）
- [BASELINE_REPORT.md](./BASELINE_REPORT.md) - 基线报告
- [MIGRATION_SIGNOFF.md](./MIGRATION_SIGNOFF.md) - 迁移签收
