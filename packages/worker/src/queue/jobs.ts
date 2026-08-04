import type { UserId } from '@hrms/shared';

export const JOBS = {
  sendNotification: 'send-notification',
  relayOutbox: 'relay-outbox',
} as const;

export type JobName = (typeof JOBS)[keyof typeof JOBS];

// Typed payload per job — the abstraction enforces that callers pass the right
// shape for the job they enqueue.
export type JobPayloads = {
  'send-notification': { readonly recipientUserId: UserId; readonly templateKey: string };
  'relay-outbox': { readonly batchSize: number };
};
