# Changelog

All notable changes to LaunchTerminal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2026-02-20

### Added
- WebSocket binary message support with automatic serialization
- Plugin dependency resolution and topological ordering
- `claw plugin list` CLI command for browsing community plugins
- OpenTelemetry auto-instrumentation for database queries
- Grafana dashboard for plugin execution metrics

### Changed
- Upgraded to Discord.js v14.14 with improved gateway handling
- Pipeline middleware now supports async generators for streaming
- Redis cache adapter uses pipelining for batch operations

### Fixed
- Race condition in WebSocket heartbeat monitor (#832)
- Memory leak in long-running Telegram adapter sessions (#841)
- Config hot-reload not picking up nested YAML changes (#845)

## [2.3.0] - 2026-01-15

### Added
- gRPC transport layer with reflection support
- Telegram inline query adapter
- `memory` plugin for conversation history with Redis backend
- Health check endpoints (`/health` and `/ready`)
- Docker Compose production template with resource limits

### Changed
- Migrated from Express to Fastify for 3x throughput improvement
- Plugin registry now supports semver version constraints
- Improved error messages for configuration validation failures

### Fixed
- Slack adapter dropping messages during reconnection (#798)
- Rate limiter not resetting window correctly on Redis failover (#805)
- TypeScript declaration files missing plugin type exports (#812)

## [2.2.0] - 2025-11-28

### Added
- Sentiment analysis plugin with multi-language support
- Prometheus metrics endpoint with custom bot metrics
- Kubernetes HPA manifest with CPU and memory scaling
- `claw config --interactive` wizard for first-time setup

### Changed
- Database layer migrated from Prisma to Drizzle ORM
- Logging switched from Winston to Pino for better performance
- Minimum Node.js version bumped to 18.0.0

### Fixed
- Discord slash commands not registering on first deploy (#756)
- Pipeline error handler swallowing original stack traces (#761)

## [2.1.0] - 2025-09-14

### Added
- Slack adapter with Socket Mode support
- Rate limiter plugin with sliding window algorithm
- Analytics plugin with PostHog integration
- Multi-stage Docker build for smaller production images

### Changed
- Plugin API now uses async lifecycle hooks
- Configuration validation moved to startup with fail-fast behavior

## [2.0.0] - 2025-07-01

### Breaking Changes
- Complete rewrite in TypeScript with strict mode
- New plugin API (v2) — see migration guide in docs
- Configuration format changed from JSON to YAML
- Minimum Node.js version: 18.0.0

### Added
- Pipeline architecture for message processing
- Plugin registry with lifecycle management
- Discord adapter with slash command support
- Web adapter with REST API
- WebSocket transport layer
- Drizzle ORM with PostgreSQL support
- Pino structured logging
- Vitest test suite

## [1.0.0] - 2025-03-15

### Added
- Initial release
- Basic bot engine with OpenClaw API integration
- Discord adapter
- Simple plugin system
- Docker support
