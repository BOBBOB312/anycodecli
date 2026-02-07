#!/usr/bin/env node
/**
 * CI Naming Guard — 检测代码中是否残留旧命名（happy-cli 相关）
 * 
 * 根据 REFACTOR_PLAN.md 第 12 节命名治理要求：
 * - 二进制名：anycodecli
 * - 数据目录前缀：~/.anycodecli
 * - 环境变量前缀：ANYCODECLI_
 * - CI 中新增旧命名检测，命中即失败
 * 
 * 允许的例外：
 * - 注释中提及 happy-cli（用于说明迁移来源）
 * - 测试文件中的 legacy entry 引用（用于兼容性测试）
 * - wire protocol 字段（happyHomeDir 等，必须保持协议兼容）
 * - 兼容性参数（--happy-starting-mode，用于向后兼容）
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

interface Violation {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
  pattern: string;
}

interface CheckResult {
  violations: Violation[];
  filesScanned: number;
  passed: boolean;
}

// 需要检测的旧命名模式
const FORBIDDEN_PATTERNS = [
  {
    name: "HAPPY_ env prefix",
    regex: /\bHAPPY_[A-Z_]+\b/g,
    exceptions: [
      // 允许在注释中提及
      /\/\/.*HAPPY_/,
      /\/\*[\s\S]*?HAPPY_[\s\S]*?\*\//,
      // 允许在字符串字面量中作为文档说明
      /["'].*旧环境变量.*HAPPY_.*["']/,
    ],
  },
  {
    name: "happy binary name",
    regex: /\bhappy\.mjs\b/g,
    exceptions: [
      // 允许在 legacy-entry.ts 中引用（用于委托）
      /legacy-entry\.ts/,
      // 允许在测试文件中引用
      /\.test\.ts/,
    ],
  },
  {
    name: "happy-cli package reference",
    regex: /["']happy-cli["']/g,
    exceptions: [
      // 允许在注释中提及
      /\/\/.*["']happy-cli["']/,
      /\/\*[\s\S]*?["']happy-cli["'][\s\S]*?\*\//,
      // 允许在 legacy-entry.ts 中引用（用于路径解析）
      /legacy-entry\.ts/,
      // 允许在测试文件中引用
      /\.test\.ts/,
    ],
  },
  {
    name: "~/.happy data directory",
    regex: /~\/\.happy\b/g,
    exceptions: [
      // 允许在注释中提及
      /\/\/.*~\/\.happy/,
      /\/\*[\s\S]*?~\/\.happy[\s\S]*?\*\//,
    ],
  },
];

// 允许的例外（wire protocol 字段和兼容性参数）
const ALLOWED_LEGACY_TERMS = [
  "happyHomeDir", // wire protocol 字段，必须保持
  "--happy-starting-mode", // 兼容性参数
  "happy-cli's", // 注释中说明来源
  "Mirrors happy-cli", // 注释中说明来源
  "lives in happy-cli", // 注释中说明来源
  "stays in happy-cli", // 注释中说明来源
  "happy-cli/", // 路径引用（在 legacy-entry.ts 中）
];

function shouldSkipFile(filePath: string): boolean {
  const skipPatterns = [
    /node_modules/,
    /\.git/,
    /dist/,
    /coverage/,
    /\.md$/,
    /package\.json$/,
    /package-lock\.json$/,
    /tsconfig\.json$/,
    /vitest\.config\.ts$/,
  ];
  return skipPatterns.some((pattern) => pattern.test(filePath));
}

function isAllowedException(
  line: string,
  match: string,
  filePath: string,
  exceptions: RegExp[]
): boolean {
  // 检查是否是允许的 legacy term
  if (ALLOWED_LEGACY_TERMS.some((term) => match.includes(term))) {
    return true;
  }

  // 检查文件级例外
  if (exceptions.some((ex) => ex.test(filePath))) {
    return true;
  }

  // 检查行级例外
  return exceptions.some((ex) => ex.test(line));
}

function scanFile(filePath: string, rootDir: string): Violation[] {
  const violations: Violation[] = [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = relative(rootDir, filePath);

  for (const pattern of FORBIDDEN_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;

      // Reset regex state
      pattern.regex.lastIndex = 0;

      while ((match = pattern.regex.exec(line)) !== null) {
        const matchText = match[0];

        if (!isAllowedException(line, matchText, filePath, pattern.exceptions)) {
          violations.push({
            file: relPath,
            line: i + 1,
            column: match.index + 1,
            match: matchText,
            context: line.trim(),
            pattern: pattern.name,
          });
        }
      }
    }
  }

  return violations;
}

function scanDirectory(dir: string, rootDir: string): Violation[] {
  let violations: Violation[] = [];

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);

    if (shouldSkipFile(fullPath)) {
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      violations = violations.concat(scanDirectory(fullPath, rootDir));
    } else if (stat.isFile() && /\.(ts|js|mjs)$/.test(fullPath)) {
      violations = violations.concat(scanFile(fullPath, rootDir));
    }
  }

  return violations;
}

function checkNaming(rootDir: string): CheckResult {
  console.log("🔍 Scanning for legacy naming violations...\n");

  const srcDir = join(rootDir, "src");
  const testsDir = join(rootDir, "tests");

  let violations: Violation[] = [];
  let filesScanned = 0;

  // Scan src directory
  if (statSync(srcDir).isDirectory()) {
    const srcViolations = scanDirectory(srcDir, rootDir);
    violations = violations.concat(srcViolations);
    filesScanned += readdirSync(srcDir, { recursive: true }).filter((f) =>
      /\.(ts|js|mjs)$/.test(f.toString())
    ).length;
  }

  // Scan tests directory
  if (statSync(testsDir).isDirectory()) {
    const testViolations = scanDirectory(testsDir, rootDir);
    violations = violations.concat(testViolations);
    filesScanned += readdirSync(testsDir, { recursive: true }).filter((f) =>
      /\.(ts|js|mjs)$/.test(f.toString())
    ).length;
  }

  return {
    violations,
    filesScanned,
    passed: violations.length === 0,
  };
}

function formatViolations(violations: Violation[]): string {
  const grouped = new Map<string, Violation[]>();

  for (const v of violations) {
    if (!grouped.has(v.file)) {
      grouped.set(v.file, []);
    }
    grouped.get(v.file)!.push(v);
  }

  let output = "";
  for (const [file, fileViolations] of grouped) {
    output += `\n📁 ${file}\n`;
    for (const v of fileViolations) {
      output += `  ${v.line}:${v.column} - [${v.pattern}] "${v.match}"\n`;
      output += `    ${v.context}\n`;
    }
  }

  return output;
}

function main() {
  const rootDir = process.cwd();
  const result = checkNaming(rootDir);

  console.log(`Files scanned: ${result.filesScanned}`);

  if (result.passed) {
    console.log("\n✅ No legacy naming violations found!");
    console.log("\nAll code follows anycodecli naming conventions:");
    console.log("  - Binary: anycodecli");
    console.log("  - Env prefix: ANYCODECLI_");
    console.log("  - Data dir: ~/.anycodecli");
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${result.violations.length} naming violation(s):`);
    console.log(formatViolations(result.violations));
    console.log("\n⚠️  Please update these references to use 'anycodecli' naming.");
    console.log("\nAllowed exceptions:");
    console.log("  - Comments mentioning happy-cli (for migration context)");
    console.log("  - Wire protocol fields (happyHomeDir)");
    console.log("  - Compatibility parameters (--happy-starting-mode)");
    console.log("  - Legacy entry references in tests");
    process.exit(1);
  }
}

main();
