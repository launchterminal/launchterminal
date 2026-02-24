# Plugin Development Guide

This guide covers everything you need to know to build custom plugins for LaunchTerminal.

## Overview

LaunchTerminal's plugin system allows you to extend the bot's functionality at every stage of the message processing pipeline. Plugins can:

- Transform incoming messages
- Add metadata and context
- Block or filter messages
- Modify outgoing responses
- React to events
- Run background tasks

## Plugin Interface

Every plugin must implement the `Plugin` interface:

```typescript
import { Plugin, PluginContext, Message } from '@launchterminal/sdk';

export default class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  priority = 50;  // Lower = runs earlier (default: 100)

  async onInit(ctx: PluginContext) {
    // Called when the plugin is loaded
    // Use ctx.config for plugin-specific configuration
    // Use ctx.logger for structured logging
  }

  async onMessage(message: Message, ctx: PluginContext) {
    // Called for every incoming message
    // Return the (possibly modified) message
    // Set message.blocked = true to stop pipeline
    return message;
  }

  async onResponse(response: BotResponse, ctx: PluginContext) {
    // Called before sending a response
    // Return the (possibly modified) response
    return response;
  }

  async onDestroy() {
    // Called when the plugin is unloaded
    // Clean up resources (timers, connections, etc.)
  }
}
```

## Configuration

Register your plugin in `claw.config.yml`:

```yaml
plugins:
  - name: "my-plugin"
    enabled: true
    path: "./plugins/my-plugin"  # Optional custom path
    config:
      my_setting: "value"
      another_setting: 42
```

## Lifecycle

1. **Load** — Plugin module is imported
2. **Init** — `onInit()` is called with config and logger
3. **Active** — Plugin processes messages via `onMessage()` / `onResponse()`
4. **Destroy** — `onDestroy()` is called during shutdown

## Best Practices

- Always handle errors gracefully — a failing plugin shouldn't crash the bot
- Use the provided logger instead of `console.log`
- Keep plugins focused — one plugin, one responsibility
- Set appropriate priority to control execution order
- Clean up resources in `onDestroy()` (timers, connections, file handles)

## Examples

See the [built-in plugins](../src/plugins/) for reference implementations.
