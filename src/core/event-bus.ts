import { EventEmitter } from 'node:events';
import type { Logger } from 'pino';
import type { EventType } from './types';

type EventHandler = (...args: unknown[]) => void;

export class EventBus {
  private readonly emitter: EventEmitter;
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
    this.logger = logger.child({ component: 'event-bus' });
  }

  on(event: EventType, handler: EventHandler): void {
    this.emitter.on(event, handler);
    this.logger.debug({ event }, 'Event handler registered');
  }

  off(event: EventType, handler: EventHandler): void {
    this.emitter.off(event, handler);
  }

  emit(event: EventType, data: unknown): void {
    this.logger.debug({ event }, 'Event emitted');
    this.emitter.emit(event, {
      type: event,
      timestamp: new Date(),
      data,
    });
  }

  once(event: EventType, handler: EventHandler): void {
    this.emitter.once(event, handler);
  }

  removeAllListeners(event?: EventType): void {
    this.emitter.removeAllListeners(event);
  }
}
