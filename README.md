# anycodecli

English | [简体中文](./README.zh-CN.md)

Control AI coding agents from anywhere — a modular, refactored CLI for Claude, Codex, and Gemini.

Free. Open source. Code anywhere.

## What is anycodecli?

`anycodecli` is a modular command-line interface that enables remote control of AI coding agents (Claude, Codex, Gemini) from mobile devices or other clients. It provides:

- **Remote Session Control** - Start coding sessions and control them from your mobile device
- **Multi-Agent Support** - Works with Claude Code, Codex, and Gemini
- **Real-time Sync** - Session state synchronization across devices
- **Daemon Mode** - Background service for managing multiple sessions
- **Modular Architecture** - Clean separation of concerns for maintainability

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Start a Claude Session

```bash
npm run dev -- claude
```

This will:
1. Start a Claude Code session
2. Display a QR code to connect from your mobile device
3. Enable real-time session sharing between Claude Code and your mobile app

### Start a Gemini Session

```bash
npm run dev -- gemini
```

**First time setup:**
```bash
# Authenticate with Google
npm run dev -- connect gemini
```

### Start a Codex Session

```bash
npm run dev -- codex
```

## Commands

### Agent Commands

- `anycodecli claude` - Start Claude Code session (default)
- `anycodecli gemini` - Start Gemini CLI session
- `anycodecli codex` - Start Codex mode

### Daemon Commands

- `anycodecli daemon start` - Start background daemon
- `anycodecli daemon stop` - Stop background daemon
- `anycodecli daemon status` - Check daemon status
- `anycodecli daemon list` - List active sessions
- `anycodecli daemon spawn-session <dir>` - Spawn new session
- `anycodecli daemon stop-session <id>` - Stop specific session

### Utility Commands

- `anycodecli auth login` - Manage authentication
- `anycodecli connect <provider>` - Connect to AI provider
- `anycodecli doctor` - Diagnose issues
- `anycodecli notify` - Send notifications

## Architecture

anycodecli follows a clean, modular architecture:

```
src/
├── app/              # Application bootstrap and routing
├── commands/         # Command implementations
├── domain/           # Business logic and orchestration
│   ├── session/      # Session management
│   ├── daemon/       # Daemon orchestration
│   └── machine/      # Machine registration
├── agents/           # AI agent integrations
│   ├── claude/       # Claude runtime
│   ├── codex/        # Codex runtime
│   ├── gemini/       # Gemini runtime
│   └── acp/          # ACP protocol
├── infra/            # Infrastructure layer
│   ├── api/          # API clients
│   ├── rpc/          # RPC handling
│   ├── persistence/  # Data persistence
│   └── logging/      # Logging
└── compatibility/    # Compatibility layer
```

### Key Design Principles

- **Modular** - Clear separation of concerns
- **Testable** - Dependency injection and mocking support
- **Extensible** - Easy to add new agents or features
- **Zero Behavior Drift** - Legacy delegation ensures compatibility

## Development

### Run Tests

```bash
npm test
```

### Type Check

```bash
npm run typecheck
```

### Naming Convention Check

```bash
npm run check-naming
```

### Full CI Pipeline

```bash
npm run ci
```

## Configuration

### Environment Variables

- `ANYCODECLI_SESSION_SYNC_MODE` - Session sync mode (`legacy` or `noop`)
- `ANYCODECLI_LEGACY_ENTRY` - Path to legacy CLI entry point

### Session Modes

- **Local Mode** - Run agent locally
- **Remote Mode** - Connect to remote daemon
- **Daemon Mode** - Background service managing multiple sessions

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

- **[REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md)** - Detailed refactoring plan and architecture
- **[BASELINE_REPORT.md](./docs/BASELINE_REPORT.md)** - Baseline behavior report
- **[CI_NAMING_GUARD.md](./docs/CI_NAMING_GUARD.md)** - CI naming guard documentation
- **[INTERFACE_CONTRACTS.md](./docs/INTERFACE_CONTRACTS.md)** - Interface contracts

See [docs/README.md](./docs/README.md) for complete documentation navigation.

## Project Status

Current implementation uses a **legacy delegation strategy** to ensure zero behavior drift during the refactoring process:

- ✅ Command layer refactored (router + modules + orchestrators)
- ✅ Session core refactored (pipeline/lifecycle/orchestrator)
- ✅ Daemon core refactored (orchestration structure)
- ✅ API & sync layer (contracts defined, types unified)
- ✅ Agent abstraction (runtime/process/updates/permissions)
- ✅ Infrastructure contracts (RPC, persistence, logging, signals)
- ✅ Naming unified (`anycodecli` everywhere)
- ✅ CI naming guard (automated checks)

All commands currently delegate to the legacy runtime to preserve exact behavior while the internal architecture is being modernized.

## Testing

The project includes comprehensive test coverage:

- **18 test files** with **79 test cases**
- Unit tests for individual modules
- Integration tests for command flow
- Parity tests to ensure behavior consistency
- CI naming guard to prevent legacy naming

Run tests with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please:

1. Read the [REFACTOR_PLAN.md](./docs/REFACTOR_PLAN.md) to understand the architecture
2. Follow the existing code style and patterns
3. Add tests for new features
4. Ensure all CI checks pass (`npm run ci`)

## License

MIT

## Related Projects

- **happy-cli** - The original CLI implementation
- **Mobile App** - Companion mobile app for remote control

## Links

- **GitHub Repository**: https://github.com/BOBBOB312/anycodecli
- **Documentation**: https://github.com/BOBBOB312/anycodecli/tree/main/docs
- **Issues**: https://github.com/BOBBOB312/anycodecli/issues
