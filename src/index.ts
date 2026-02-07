import { bootstrap } from "./app/bootstrap.js";

async function main(): Promise<void> {
  const code = await bootstrap(process.argv.slice(2));
  process.exitCode = code;
}

main().catch(() => {
  process.exitCode = 1;
});
