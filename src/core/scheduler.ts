import type { Logger } from 'pino';

interface ScheduledTask {
  name: string;
  interval: number;
  handler: () => Promise<void>;
  timer?: ReturnType<typeof setInterval>;
}

export class Scheduler {
  private readonly tasks: Map<string, ScheduledTask> = new Map();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'scheduler' });
  }

  register(name: string, intervalMs: number, handler: () => Promise<void>): void {
    if (this.tasks.has(name)) {
      this.logger.warn({ task: name }, 'Task already registered, replacing');
      this.stop(name);
    }

    this.tasks.set(name, { name, interval: intervalMs, handler });
    this.logger.info({ task: name, interval: `${intervalMs}ms` }, 'Task registered');
  }

  start(name: string): void {
    const task = this.tasks.get(name);
    if (!task) {
      this.logger.warn({ task: name }, 'Task not found');
      return;
    }

    task.timer = setInterval(() => {
      task.handler().catch((error: unknown) => {
        this.logger.error({ task: name, error }, 'Scheduled task error');
      });
    }, task.interval);

    this.logger.info({ task: name }, 'Task started');
  }

  stop(name: string): void {
    const task = this.tasks.get(name);
    if (task?.timer) {
      clearInterval(task.timer);
      task.timer = undefined;
      this.logger.info({ task: name }, 'Task stopped');
    }
  }

  startAll(): void {
    for (const name of this.tasks.keys()) {
      this.start(name);
    }
  }

  stopAll(): void {
    for (const name of this.tasks.keys()) {
      this.stop(name);
    }
  }
}
