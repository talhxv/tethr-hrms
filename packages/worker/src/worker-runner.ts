import { Worker, type ConnectionOptions, type Job } from 'bullmq';

import { processSendNotification } from './processors/send-notification.processor';
import { JOBS, type JobName } from './queue/jobs';
import { QUEUES } from './queue/queues';

// Routes jobs on a queue to their processor by name. A real worker would
// dead-letter unknown job names rather than ignore them.
export const startWorker = (connection: ConnectionOptions): Worker => {
  return new Worker(
    QUEUES.notifications,
    async (job: Job) => {
      const jobName = job.name as JobName;
      switch (jobName) {
        case JOBS.sendNotification:
          await processSendNotification(job);
          return;
        case JOBS.relayOutbox:
          return;
        default:
          return;
      }
    },
    { connection },
  );
};
