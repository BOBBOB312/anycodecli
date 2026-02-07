#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const out = process.env.MOCK_LEGACY_OUTPUT;
if (out) {
  writeFileSync(
    out,
    JSON.stringify(
      {
        args: process.argv.slice(2),
        cwd: process.cwd()
      },
      null,
      2
    )
  );
}

const code = Number(process.env.MOCK_LEGACY_EXIT || "0");
process.exit(Number.isNaN(code) ? 0 : code);
