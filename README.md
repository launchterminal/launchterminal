<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" />
  <img src="https://img.shields.io/badge/coverage-97%25-brightgreen?style=flat-square" alt="Coverage" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/version-2.4.0-purple?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=flat-square" alt="Node" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

<h1 align="center">
  🚀 LaunchTerminal
</h1>

<p align="center">
  <strong>The open-source launchpad for deploying your own OpenClaw AI bot.</strong><br />
  Fork it. Customize it. Ship it. No vendor lock-in, no black boxes.
</p>

<p align="center">
  <a href="https://launchterminal.dev">Website</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Docs</a> •
  <a href="#architecture">Architecture</a> •
  <a href="CONTRIBUTING.md">Contributing</a> •
  <a href="https://discord.gg/launchterminal">Discord</a>
</p>

---

## 🎯 What is LaunchTerminal?

LaunchTerminal is a fully open-source platform that lets you deploy, manage, and scale your own OpenClaw AI bot in minutes. Built with a modular plugin architecture, real-time WebSocket communication layer, and edge-optimized runtime — it's designed to be forked, hacked, and extended by the community.

### Why LaunchTerminal?

| Feature | LaunchTerminal | Other Platforms |
|---|---|---|
| **Open Source** | ✅ MIT Licensed | ❌ Proprietary |
| **Self-Hosted** | ✅ Full control | ❌ Vendor lock-in |
| **Plugin System** | ✅ 50+ plugins | ⚠️ Limited |
| **Multi-Platform** | ✅ Discord, Slack, Telegram, Web | ⚠️ 1-2 platforms |
| **Edge Runtime** | ✅ Global CDN | ❌ Single region |
| **Type-Safe SDK** | ✅ TS, Python, Go | ⚠️ JS only |
| **Privacy** | ✅ Your data, your server | ❌ Third-party storage |

---

## ✨ Features

- **🔌 Plugin Architecture** — Extend functionality with community-built plugins. Sentiment analysis, multi-language support, rate limiting, analytics, and more.
- **⚡ Edge-Optimized Runtime** — Deploys to 300+ edge locations via Vercel/Cloudflare Workers. Sub-50ms response times globally.
- **🔒 Privacy-First** — Fully self-hosted. Zero telemetry by default. Your conversations never leave your infrastructure.
- **🎨 Customizable Personality Engine** — Fine-tune your bot's personality, tone, and response patterns through simple YAML configuration.
- **📡 Real-Time WebSocket Layer** — Built-in WebSocket server with automatic reconnection, heartbeat monitoring, and binary message support.
- **🐳 Docker-Native** — First-class Docker support with multi-stage builds, health checks, and docker-compose for local development.
- **🧪 Comprehensive Test Suite** — 97% code coverage with unit, integration, and E2E tests. CI/CD pipeline included.
- **📊 Built-in Observability** — Structured logging (Pino), Prometheus metrics, OpenTelemetry traces, and Grafana dashboards out of the box.
- **🌐 Multi-Platform Adapters** — Single codebase deploys to Discord, Slack, Telegram, and the web. Write once, launch everywhere.
- **🔄 Hot-Reload Config** — Update personality, plugins, and routing rules without restarting. Zero-downtime configuration changes.

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (recommended) or npm
- Docker (optional, for containerized deployment)
- An OpenClaw API key ([get one here](https://openclaw.dev/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/launchterminal/launchterminal.git
cd launchterminal

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure your API keys
nano .env

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### One-Line Deploy

```bash
npx create-openclaw@latest my-bot --template launchterminal
```

### Docker

```bash
# Development
docker-compose up -d

# Production
docker build -t launchterminal:latest .
docker run -p 3000:3000 --env-file .env launchterminal:latest
```

---

## 📁 Project Structure

```
launchterminal/
├── src/
│   ├── core/                  # Core bot engine
│   │   ├── engine.ts          # Main orchestration engine
│   │   ├── pipeline.ts        # Message processing pipeline
│   │   ├── scheduler.ts       # Task scheduler & cron jobs
│   │   └── registry.ts        # Plugin registry & lifecycle
│   ├── adapters/              # Platform adapters
│   │   ├── discord.ts         # Discord adapter
│   │   ├── slack.ts           # Slack adapter
│   │   ├── telegram.ts        # Telegram adapter
│   │   └── web.ts             # Web/REST adapter
│   ├── plugins/               # Built-in plugins
│   │   ├── sentiment/         # Sentiment analysis plugin
│   │   ├── i18n/              # Internationalization plugin
│   │   ├── rate-limiter/      # Rate limiting plugin
│   │   └── analytics/         # Analytics & metrics plugin
│   ├── transport/             # Communication layer
│   │   ├── ws.ts              # WebSocket server
│   │   ├── http.ts            # HTTP/REST endpoints
│   │   └── grpc.ts            # gRPC service definitions
│   ├── config/                # Configuration management
│   │   ├── schema.ts          # Zod config schemas
│   │   ├── loader.ts          # Config file loader
│   │   └── validator.ts       # Runtime config validation
│   ├── db/                    # Database layer
│   │   ├── migrations/        # SQL migrations
│   │   ├── models/            # Drizzle ORM models
│   │   └── seed.ts            # Development seed data
│   ├── observability/         # Monitoring & telemetry
│   │   ├── logger.ts          # Pino structured logger
│   │   ├── metrics.ts         # Prometheus metrics
│   │   └── tracer.ts          # OpenTelemetry tracer
│   └── utils/                 # Shared utilities
│       ├── crypto.ts          # Encryption helpers
│       ├── retry.ts           # Retry with exponential backoff
│       └── errors.ts          # Custom error classes
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
├── docs/                      # Documentation
├── infra/                     # Infrastructure as Code
│   ├── terraform/             # Terraform configs
│   ├── k8s/                   # Kubernetes manifests
│   └── monitoring/            # Grafana/Prometheus configs
├── scripts/                   # Build & deployment scripts
├── .github/                   # GitHub Actions workflows
├── docker-compose.yml         # Local development stack
├── Dockerfile                 # Multi-stage production build
├── claw.config.yml            # Bot configuration
├── turbo.json                 # Turborepo config
└── package.json
```

---

## ⚙️ Configuration

LaunchTerminal uses a layered configuration system. The primary config file is `claw.config.yml`:

```yaml
# claw.config.yml
bot:
  name: "MyClaw"
  version: "1.0.0"
  personality: "friendly"
  language: "en"

engine:
  max_tokens: 4096
  temperature: 0.7
  streaming: true
  timeout_ms: 30000

platforms:
  discord:
    enabled: true
    prefix: "!"
    guilds: ["*"]
  slack:
    enabled: false
  telegram:
    enabled: false
  web:
    enabled: true
    cors: ["https://yourdomain.com"]

plugins:
  - name: "sentiment"
    enabled: true
    config:
      threshold: 0.3
  - name: "rate-limiter"
    enabled: true
    config:
      max_requests: 60
      window_ms: 60000
  - name: "analytics"
    enabled: true
    config:
      provider: "posthog"

observability:
  log_level: "info"
  metrics: true
  tracing: true
  tracing_endpoint: "http://localhost:4318"

database:
  provider: "postgres"
  url: "${DATABASE_URL}"
  pool_size: 20
  ssl: true
```

### Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `OPENCLAW_API_KEY` | Your OpenClaw API key | ✅ | — |
| `DATABASE_URL` | PostgreSQL connection string | ✅ | — |
| `REDIS_URL` | Redis connection string | ❌ | `redis://localhost:6379` |
| `DISCORD_TOKEN` | Discord bot token | ❌ | — |
| `SLACK_BOT_TOKEN` | Slack bot token | ❌ | — |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | ❌ | — |
| `PORT` | HTTP server port | ❌ | `3000` |
| `WS_PORT` | WebSocket server port | ❌ | `3001` |
| `LOG_LEVEL` | Log level (debug/info/warn/error) | ❌ | `info` |
| `NODE_ENV` | Environment (development/production) | ❌ | `development` |
| `ENCRYPTION_KEY` | 256-bit key for data encryption | ❌ | auto-generated |
| `OTEL_EXPORTER_ENDPOINT` | OpenTelemetry collector endpoint | ❌ | — |

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────┐
                    │        LaunchTerminal Core       │
                    │                                  │
  ┌──────────┐     │  ┌──────────┐   ┌────────────┐  │     ┌──────────┐
  │ Discord  │◄────┤  │ Message  │   │ Personality│  ├────►│ OpenClaw │
  │ Adapter  │     │  │ Pipeline │──►│   Engine   │  │     │   API    │
  ├──────────┤     │  └──────────┘   └────────────┘  │     └──────────┘
  │  Slack   │◄────┤       │              │          │
  │ Adapter  │     │  ┌────▼─────┐  ┌─────▼──────┐  │     ┌──────────┐
  ├──────────┤     │  │  Plugin  │  │  Response   │  ├────►│ Postgres │
  │ Telegram │◄────┤  │ Registry │  │  Formatter  │  │     │    DB    │
  │ Adapter  │     │  └──────────┘  └────────────┘  │     └──────────┘
  ├──────────┤     │       │                         │
  │   Web    │◄────┤  ┌────▼─────┐                   │     ┌──────────┐
  │ Adapter  │     │  │  Event   │                   ├────►│  Redis   │
  └──────────┘     │  │   Bus    │                   │     │  Cache   │
                    │  └──────────┘                   │     └──────────┘
                    └─────────────────────────────────┘
```

LaunchTerminal follows a **pipeline architecture** where every message passes through a series of middleware functions before reaching the AI engine. This allows plugins to intercept, transform, or short-circuit messages at any stage.

### Key Concepts

- **Adapters** normalize platform-specific message formats into a unified internal representation
- **Pipeline** processes messages through an ordered chain of middleware (auth → rate-limit → transform → route → respond)
- **Plugin Registry** manages plugin lifecycle (init → activate → deactivate → destroy) with dependency resolution
- **Event Bus** enables decoupled inter-plugin communication via typed events
- **Response Formatter** adapts AI responses back to platform-specific formats (embeds, blocks, markdown)

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests (requires Docker)
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## 🔌 Plugin Development

Create custom plugins to extend LaunchTerminal:

```typescript
import { Plugin, PluginContext, Message } from '@launchterminal/sdk';

export default class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';

  async onInit(ctx: PluginContext) {
    ctx.logger.info('MyPlugin initialized');
  }

  async onMessage(message: Message, ctx: PluginContext) {
    // Transform, filter, or enrich messages
    if (message.content.includes('hello')) {
      message.metadata.set('greeting', true);
    }
    return message;
  }

  async onDestroy() {
    // Cleanup resources
  }
}
```

Register your plugin in `claw.config.yml`:

```yaml
plugins:
  - name: "my-plugin"
    enabled: true
    path: "./plugins/my-plugin"
```

See the [Plugin Development Guide](docs/plugins.md) for the full API reference.

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/launchterminal/launchterminal)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/launchterminal)

### Docker Compose (Self-Hosted)

```bash
# Production deployment with Postgres + Redis
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/health
```

### Kubernetes

```bash
kubectl apply -f infra/k8s/
```

See [Deployment Guide](docs/deployment.md) for detailed instructions on all platforms.

---

## 📊 Observability

LaunchTerminal ships with production-grade observability:

- **Structured Logging** — JSON logs via Pino with request correlation IDs
- **Metrics** — Prometheus-compatible `/metrics` endpoint with pre-built Grafana dashboards
- **Distributed Tracing** — OpenTelemetry integration for end-to-end request tracing
- **Health Checks** — `/health` and `/ready` endpoints for load balancer integration
- **Error Tracking** — Sentry integration with source maps and breadcrumbs

```bash
# Start the full observability stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana dashboard
open http://localhost:3030
```

---

## 🗺️ Roadmap

- [x] Core bot engine with streaming support
- [x] Discord, Slack, and Telegram adapters
- [x] Plugin system with lifecycle management
- [x] Docker + Kubernetes deployment
- [x] Prometheus metrics + Grafana dashboards
- [x] WebSocket real-time transport
- [ ] Voice channel support (Discord)
- [ ] Workflow automation engine
- [ ] Visual plugin builder (drag & drop)
- [ ] Multi-tenant SaaS mode
- [ ] Mobile app (React Native)
- [ ] Marketplace for community plugins

See the [full roadmap](https://github.com/launchterminal/launchterminal/projects/1) on GitHub.

---

## 🤝 Contributing

We love contributions! LaunchTerminal is built by the community, for the community.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting PRs.

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/launchterminal.git
cd launchterminal

# Install dependencies
pnpm install

# Start development environment (app + postgres + redis)
pnpm dev:full

# Run linter
pnpm lint

# Run type checker
pnpm typecheck

# Run tests in watch mode
pnpm test:watch
```

---

## 📜 License

LaunchTerminal is [MIT Licensed](LICENSE). Use it for anything — personal projects, startups, or enterprise. No strings attached.

---

## 💖 Sponsors

<p align="center">
  <em>LaunchTerminal is proudly supported by:</em>
</p>

<p align="center">
  <a href="https://openclaw.dev">OpenClaw</a> •
  <a href="https://vercel.com">Vercel</a> •
  <a href="https://railway.app">Railway</a>
</p>

<p align="center">
  <a href="https://github.com/sponsors/launchterminal">Become a Sponsor</a>
</p>

---

<p align="center">
  Made with ❤️ by the <a href="https://github.com/launchterminal">LaunchTerminal</a> community
</p>
