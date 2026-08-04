import type { Job } from 'bullmq';

import type { JobPayloads } from '../queue/jobs';

// Example processor, co-located with the work it handles (architecture.md §4.2).
// In the full system the outbox-relay processor would invoke the API's OutboxRelay
// to deliver pending domain events on an interval.
export const processSendNotification = async (
  job: Job<JobPayloads['send-notification']>,
): Promise<void> => {
  console.log(
    `[worker] send-notification -> user ${job.data.recipientUserId} (template: ${job.data.templateKey})`,
  );
  return Promise.resolve();
};
