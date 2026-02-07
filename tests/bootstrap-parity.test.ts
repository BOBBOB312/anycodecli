import { describe, it, expect } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bootstrap } from "../src/app/bootstrap.js";
import { legacyEntryEnvName } from "../src/infra/process/legacy-entry.js";

async function readJson(path: string): Promise<{ args: string[] }> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as { args: string[] };
}

describe("bootstrap parity via mock legacy entry", () => {
  it("routes daemon command with parsed args", async () => {
    const envName = legacyEntryEnvName();
    const prevEntry = process.env[envName];
    const prevOut = process.env.MOCK_LEGACY_OUTPUT;

    const dir = await mkdtemp(join(tmpdir(), "anycodecli-test-"));
    const out = join(dir, "daemon.json");
    process.env[envName] = resolve(process.cwd(), "tests/fixtures/mock-legacy.mjs");
    process.env.MOCK_LEGACY_OUTPUT = out;
    process.env.MOCK_LEGACY_EXIT = "0";

    const code = await bootstrap(["daemon", "start"]);
    const payload = await readJson(out);

    expect(code).toBe(0);
    expect(payload.args).toEqual(["daemon", "start"]);

    if (prevEntry === undefined) delete process.env[envName]; else process.env[envName] = prevEntry;
    if (prevOut === undefined) delete process.env.MOCK_LEGACY_OUTPUT; else process.env.MOCK_LEGACY_OUTPUT = prevOut;
    delete process.env.MOCK_LEGACY_EXIT;
  });

  it("routes agent command through orchestrator runtime path", async () => {
    const envName = legacyEntryEnvName();
    const prevEntry = process.env[envName];
    const prevOut = process.env.MOCK_LEGACY_OUTPUT;

    const dir = await mkdtemp(join(tmpdir(), "anycodecli-test-"));
    const out = join(dir, "agent.json");
    process.env[envName] = resolve(process.cwd(), "tests/fixtures/mock-legacy.mjs");
    process.env.MOCK_LEGACY_OUTPUT = out;
    process.env.MOCK_LEGACY_EXIT = "0";

    const code = await bootstrap(["claude", "--anycodecli-starting-mode", "remote", "--help"]);
    const payload = await readJson(out);

    expect(code).toBe(0);
    expect(payload.args).toEqual([
      "claude",
      "--happy-starting-mode",
      "remote",
      "--help"
    ]);

    if (prevEntry === undefined) delete process.env[envName]; else process.env[envName] = prevEntry;
    if (prevOut === undefined) delete process.env.MOCK_LEGACY_OUTPUT; else process.env.MOCK_LEGACY_OUTPUT = prevOut;
    delete process.env.MOCK_LEGACY_EXIT;
  });
});
