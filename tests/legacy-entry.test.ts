import { describe, it, expect } from "vitest";
import { resolveLegacyEntryPath, legacyEntryEnvName } from "../src/infra/process/legacy-entry.js";

describe("resolveLegacyEntryPath", () => {
  it("uses env override when present", () => {
    const envKey = legacyEntryEnvName();
    const prev = process.env[envKey];
    process.env[envKey] = "/tmp/custom-legacy.mjs";

    const path = resolveLegacyEntryPath("/repo");
    expect(path).toBe("/tmp/custom-legacy.mjs");

    if (prev === undefined) {
      delete process.env[envKey];
    } else {
      process.env[envKey] = prev;
    }
  });

  it("falls back to workspace-relative legacy binary", () => {
    const envKey = legacyEntryEnvName();
    const prev = process.env[envKey];
    delete process.env[envKey];

    const path = resolveLegacyEntryPath("/repo/anycodecli");
    expect(path).toBe("/repo/happy-cli/bin/happy.mjs");

    if (prev !== undefined) {
      process.env[envKey] = prev;
    }
  });
});
