/**
 * Parity tests — verify that anycodecli produces identical routing behavior
 * to happy-cli for every command path.
 *
 * Uses mock-legacy.mjs to capture the exact args that would be forwarded.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bootstrap } from "../src/app/bootstrap.js";
import { legacyEntryEnvName } from "../src/infra/process/legacy-entry.js";

const MOCK_ENTRY = resolve(process.cwd(), "tests/fixtures/mock-legacy.mjs");
let dir: string;
let prevEntry: string | undefined;
let prevOut: string | undefined;

function outPath(name: string): string {
  return join(dir, `${name}.json`);
}

async function readPayload(name: string): Promise<{ args: string[]; cwd: string }> {
  return JSON.parse(await readFile(outPath(name), "utf8"));
}

async function run(argv: string[], name: string): Promise<{ code: number; args: string[] }> {
  const out = outPath(name);
  process.env[legacyEntryEnvName()] = MOCK_ENTRY;
  process.env.MOCK_LEGACY_OUTPUT = out;
  process.env.MOCK_LEGACY_EXIT = "0";
  const code = await bootstrap(argv);
  const payload = await readPayload(name);
  return { code, args: payload.args };
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "parity-"));
  prevEntry = process.env[legacyEntryEnvName()];
  prevOut = process.env.MOCK_LEGACY_OUTPUT;
});

afterEach(() => {
  if (prevEntry === undefined) delete process.env[legacyEntryEnvName()];
  else process.env[legacyEntryEnvName()] = prevEntry;
  if (prevOut === undefined) delete process.env.MOCK_LEGACY_OUTPUT;
  else process.env.MOCK_LEGACY_OUTPUT = prevOut;
  delete process.env.MOCK_LEGACY_EXIT;
});

// ── Batch A: CLI 入口与命令 ──

describe("parity: root command", () => {
  it("--help forwards as-is", async () => {
    const { code, args } = await run(["--help"], "help");
    expect(code).toBe(0);
    expect(args).toEqual(["--help"]);
  });

  it("--version forwards as-is", async () => {
    const { code, args } = await run(["--version"], "version");
    expect(code).toBe(0);
    expect(args).toEqual(["--version"]);
  });

  it("unknown command falls through to root", async () => {
    const { code, args } = await run(["nonexistent", "--flag"], "unknown");
    expect(code).toBe(0);
    expect(args).toEqual(["nonexistent", "--flag"]);
  });
});

describe("parity: subcommands", () => {
  it("auth login", async () => {
    const { code, args } = await run(["auth", "login"], "auth-login");
    expect(code).toBe(0);
    expect(args).toEqual(["auth", "login"]);
  });

  it("auth logout", async () => {
    const { code, args } = await run(["auth", "logout"], "auth-logout");
    expect(code).toBe(0);
    expect(args).toEqual(["auth", "logout"]);
  });

  it("connect gemini", async () => {
    const { code, args } = await run(["connect", "gemini"], "connect-gemini");
    expect(code).toBe(0);
    expect(args).toEqual(["connect", "gemini"]);
  });

  it("doctor", async () => {
    const { code, args } = await run(["doctor"], "doctor");
    expect(code).toBe(0);
    expect(args).toEqual(["doctor"]);
  });

  it("doctor clean", async () => {
    const { code, args } = await run(["doctor", "clean"], "doctor-clean");
    expect(code).toBe(0);
    expect(args).toEqual(["doctor", "clean"]);
  });

  it("notify -p msg -t title", async () => {
    const { code, args } = await run(["notify", "-p", "hello", "-t", "Test"], "notify");
    expect(code).toBe(0);
    expect(args).toEqual(["notify", "-p", "hello", "-t", "Test"]);
  });
});

describe("parity: daemon commands", () => {
  it("daemon start", async () => {
    const { code, args } = await run(["daemon", "start"], "daemon-start");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "start"]);
  });

  it("daemon stop", async () => {
    const { code, args } = await run(["daemon", "stop"], "daemon-stop");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "stop"]);
  });

  it("daemon status", async () => {
    const { code, args } = await run(["daemon", "status"], "daemon-status");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "status"]);
  });

  it("daemon list", async () => {
    const { code, args } = await run(["daemon", "list"], "daemon-list");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "list"]);
  });

  it("daemon stop-session <id>", async () => {
    const { code, args } = await run(["daemon", "stop-session", "sess-123"], "daemon-stop-session");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "stop-session", "sess-123"]);
  });

  it("daemon spawn-session <dir> --session-id <id>", async () => {
    const { code, args } = await run(
      ["daemon", "spawn-session", "/tmp/proj", "--session-id", "s-42"],
      "daemon-spawn"
    );
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "spawn-session", "/tmp/proj", "--session-id", "s-42"]);
  });

  it("daemon unknown-sub falls through", async () => {
    const { code, args } = await run(["daemon", "logs"], "daemon-logs");
    expect(code).toBe(0);
    expect(args).toEqual(["daemon", "logs"]);
  });
});

describe("parity: agent commands", () => {
  it("claude with no args", async () => {
    const { code, args } = await run(["claude"], "claude-bare");
    expect(code).toBe(0);
    expect(args).toContain("claude");
    expect(args).toContain("--happy-starting-mode");
    expect(args).toContain("local");
  });

  it("claude --anycodecli-starting-mode remote --help", async () => {
    const { code, args } = await run(
      ["claude", "--anycodecli-starting-mode", "remote", "--help"],
      "claude-remote"
    );
    expect(code).toBe(0);
    expect(args).toContain("claude");
    expect(args).toContain("--happy-starting-mode");
    expect(args).toContain("remote");
    expect(args).toContain("--help");
    // --anycodecli-starting-mode should NOT appear in forwarded args
    expect(args).not.toContain("--anycodecli-starting-mode");
  });

  it("codex with passthrough args", async () => {
    const { code, args } = await run(["codex", "--started-by", "daemon"], "codex-passthrough");
    expect(code).toBe(0);
    expect(args).toContain("codex");
    expect(args).toContain("--started-by");
    expect(args).toContain("daemon");
  });

  it("gemini with passthrough args", async () => {
    const { code, args } = await run(["gemini", "--some-flag"], "gemini-passthrough");
    expect(code).toBe(0);
    expect(args).toContain("gemini");
    expect(args).toContain("--some-flag");
  });

  it("claude --happy-starting-mode local (legacy compat)", async () => {
    const { code, args } = await run(
      ["claude", "--happy-starting-mode", "local", "--resume"],
      "claude-legacy-mode"
    );
    expect(code).toBe(0);
    expect(args).toContain("claude");
    expect(args).toContain("--happy-starting-mode");
    expect(args).toContain("local");
    expect(args).toContain("--resume");
  });
});

// ── Exit code propagation ──

describe("parity: exit code propagation", () => {
  it("propagates non-zero exit code from legacy process", async () => {
    const out = outPath("exit-code");
    process.env[legacyEntryEnvName()] = MOCK_ENTRY;
    process.env.MOCK_LEGACY_OUTPUT = out;
    process.env.MOCK_LEGACY_EXIT = "42";
    const code = await bootstrap(["daemon", "start"]);
    expect(code).toBe(42);
  });
});
