# Contributing to LaunchTerminal

First off, thank you for considering contributing to LaunchTerminal! It's people like you that make this project great. This document provides guidelines and information about contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Plugin Development](#plugin-development)
- [Testing](#testing)
- [Community](#community)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for integration tests)
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/launchterminal.git
cd launchterminal

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development dependencies
docker-compose up -d postgres redis

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development server with hot reload
pnpm dev
```

### Useful Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build for production |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm typecheck` | Run TypeScript type checker |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Architecture

LaunchTerminal follows a modular pipeline architecture:

```
src/
├── core/          # Core engine, pipeline, scheduler, registry
├── adapters/      # Platform-specific adapters (Discord, Slack, etc.)
├── plugins/       # Built-in plugin implementations
├── transport/     # WebSocket, HTTP, and gRPC layers
├── config/        # Configuration loading and validation
├── db/            # Database models, migrations, and queries
├── observability/ # Logging, metrics, and tracing
└── utils/         # Shared utility functions
```

### Key Design Principles

1. **Pipeline-first**: Every message flows through an ordered middleware chain
2. **Plugin-based**: Core functionality is implemented as plugins where possible
3. **Adapter pattern**: Platform differences are abstracted behind a unified interface
4. **Type-safe**: Strict TypeScript with Zod runtime validation at boundaries
5. **Observable**: Structured logging, metrics, and traces built in from day one

## Making Changes

### Branch Naming

Use descriptive branch names following this convention:

- `feat/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring
- `test/description` — Test additions or fixes
- `chore/description` — Maintenance tasks

### Code Style

- We use ESLint + Prettier for code formatting
- Run `pnpm lint:fix` before committing
- Follow existing patterns in the codebase
- Use TypeScript strict mode (`strict: true`)
- Prefer `const` over `let`, never use `var`
- Use explicit return types on exported functions

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```
feat(adapters): add Telegram voice message support
fix(pipeline): resolve race condition in middleware chain
docs(readme): update deployment instructions for Railway
test(plugins): add integration tests for rate-limiter
```

## Pull Request Process

1. Update documentation if your change affects public APIs
2. Add or update tests for your changes
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Ensure types check: `pnpm typecheck`
6. Fill out the PR template completely
7. Request review from at least one maintainer

### Review Criteria

- Code quality and adherence to project conventions
- Test coverage for new functionality
- Documentation for public API changes
- No regressions in existing tests
- Performance impact considered

## Plugin Development

Want to build a plugin? Check out the [Plugin Development Guide](docs/plugins.md).

Quick example:

```typescript
import { Plugin, PluginContext, Message } from '@launchterminal/sdk';

export default class MyPlugin implements Plugin {
  name = 'my-awesome-plugin';
  version = '1.0.0';

  async onInit(ctx: PluginContext) {
    ctx.logger.info('Plugin initialized!');
  }

  async onMessage(message: Message, ctx: PluginContext) {
    // Your logic here
    return message;
  }
}
```

## Testing

### Writing Tests

- Place unit tests in `tests/unit/` mirroring the `src/` structure
- Place integration tests in `tests/integration/`
- Use descriptive test names: `it('should reject messages exceeding rate limit')`
- Use `testcontainers` for integration tests needing databases

### Running Tests

```bash
# All tests
pnpm test

# Specific file
pnpm test -- tests/unit/core/pipeline.test.ts

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Community

- **Discord**: [Join our server](https://discord.gg/launchterminal)
- **GitHub Discussions**: Ask questions and share ideas
- **X (Twitter)**: Follow [@launchterminal](https://x.com/launchterminal)

## Questions?

If you have questions about contributing, feel free to:
1. Open a [GitHub Discussion](https://github.com/launchterminal/launchterminal/discussions)
2. Ask in our [Discord](https://discord.gg/launchterminal)
3. Reach out on [X](https://x.com/launchterminal)

Thank you for contributing! 🚀
