# anycodecli

`anycodecli` is the modular refactor workspace.

Current implementation status:

- Phase 1 scaffold is implemented.
- CLI bootstrap and command router are split into dedicated modules.
- Each command currently delegates to the legacy runtime to preserve behavior.
- Phase 2 core modules are scaffolded:
  - `domain/session/message-pipeline.ts`
  - `domain/session/session-lifecycle.ts`
  - `domain/session/session-orchestrator.ts`
  - `domain/session/readiness-policy.ts`
  - `infra/api/session-sync-client.ts`
- Phase 3 runtime foundation is scaffolded:
  - `agents/contracts/agent-message.ts` (single source of message types)
  - `agents/contracts/agent-backend.ts`
  - `agents/contracts/permission-handler.ts`
  - `agents/shared/legacy-process-session-runtime.ts`
  - `agents/claude|codex|gemini/*-runtime.ts`
  - `domain/session/legacy-runtime-factory.ts`
- Phase 4 (Batch B) API & sync layer contracts:
  - `infra/api/types.ts` (unified API type definitions)
  - `infra/api/api-client.ts` (API client interface)
  - `infra/api/machine-sync-client.ts` (machine sync contract)
- Phase 4 (Batch D) ACP & Agent abstraction:
  - `agents/acp/acp-runtime.ts` (ACP runtime factory)
  - `agents/acp/acp-process.ts` (ACP process lifecycle)
  - `agents/acp/acp-session-updates.ts` (session update dispatch)
  - `agents/acp/acp-permissions.ts` (permission pipeline)
- Phase 4 (Batch E) Daemon HTTP layer:
  - `infra/daemon-http/control-server.ts` (HTTP control server contract)
  - `infra/daemon-http/control-client.ts` (HTTP control client contract)
- Infrastructure contracts:
  - `infra/rpc/rpc-handler-registry.ts` (RPC handler registry)
  - `infra/persistence/persistence.ts` (credentials, daemon state, settings)
  - `infra/logging/logger.ts` (logger contract)
  - `infra/process/signal-manager.ts` (centralized signal handling)
  - `domain/machine/machine-service.ts` (machine registration)
- Compatibility layer:
  - `compatibility/cli-parity/parity-check.ts`
- Agent commands (`claude/codex/gemini`) now run through `SessionOrchestrator`
  while still executing legacy provider processes under the hood.
- Command context now uses dependency injection for `ProcessSpawner`
  and `SessionSyncClientFactory`, so runtime dependencies are replaceable.
- Daemon command now routes through `domain/daemon/daemon-orchestrator.ts`
  and `domain/daemon/legacy-daemon-gateway.ts`.
- Daemon internals are split with reusable services:
  - `domain/daemon/child-registry.ts`
  - `domain/daemon/spawn-service.ts`
  - `domain/daemon/heartbeat-service.ts`
- Session sync now supports configurable mode via
  `ANYCODECLI_SESSION_SYNC_MODE=legacy|noop`.
- Non-agent commands are now routed via domain orchestrators/gateways
  (`domain/subcommand/*`, `domain/daemon/*`) instead of direct command-level delegation.
- Bootstrap now composes dependencies through
  `src/app/context-factory.ts`, making app assembly explicit.

## Current Completion State

- Command-layer refactor: completed (router + command modules + orchestrators).
- Session core refactor: completed for internal abstractions (`pipeline/lifecycle/orchestrator`).
- Daemon core refactor: completed for local orchestration structure.
- API & sync layer: completed (contracts defined, types unified).
- ACP agent abstraction: completed (runtime/process/updates/permissions contracts).
- Daemon HTTP layer: completed (control-server/control-client contracts).
- Infrastructure contracts: completed (RPC, persistence, logging, signals, machine).
- Naming migration: binary=`anycodecli`, env=`ANYCODECLI_*`, package=`anycodecli`.
- Compatibility strategy: still uses legacy runtime execution bridge for zero behavior drift.

This gives zero-behavior-drift while enabling gradual migration of internals.

## Run

```bash
npm install
npm run dev -- --help
```

## Test

```bash
npm test
```
