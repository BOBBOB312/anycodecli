import { resolve } from "node:path";

const LEGACY_ENTRY_ENV = "ANYCODECLI_LEGACY_ENTRY";

export function resolveLegacyEntryPath(cwd = process.cwd()): string {
  const fromEnv = process.env[LEGACY_ENTRY_ENV];
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return resolve(cwd, "../happy-cli/bin/happy.mjs");
}

export function legacyEntryEnvName(): string {
  return LEGACY_ENTRY_ENV;
}
