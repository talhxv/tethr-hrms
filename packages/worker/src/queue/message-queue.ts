import { Queue, type ConnectionOptions } from 'bullmq';

import type { JobName, JobPayloads } from './jobs';
import type { QueueName } from './queues';

// The queue abstraction (architecture.md §4.1). Business code calls
// `messageQueue.add(...)`; the underlying library (BullMQ) can be swapped without
// touching callers. Takes plain connection options so BullMQ owns its own client.
export class MessageQueue {
  private readonly queues = new Map<QueueName, Queue>();

  constructor(private readonly connection: ConnectionOptions) {}

  async add<TJob extends JobName>(
    queueName: QueueName,
    jobName: TJob,
    payload: JobPayloads[TJob],
  ): Promise<void> {
    await this.getQueue(queueName).add(jobName, payload);
  }

  private getQueue(name: QueueName): Queue {
    const existing = this.queues.get(name);
    if (existing) {
      return existing;
    }
    const queue = new Queue(name, { connection: this.connection });
    this.queues.set(name, queue);
    return queue;
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
  }
}
