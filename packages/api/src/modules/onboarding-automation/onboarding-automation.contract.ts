import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  ONBOARDING_AUTOMATION_STAGES,
  type OnboardingAutomationStage,
} from '@hrms/shared';
import { z } from 'zod';

// The wire contract between the HRMS and the onboarding workflow (n8n). Pure
// functions only, so the shape the workflow depends on is pinned by unit tests
// and documented in docs/onboarding-automation.md. Bump PAYLOAD_VERSION on any
// breaking change to the outgoing body.
export const PAYLOAD_VERSION = 1;
export const SIGNATURE_HEADER = 'x-hrms-signature';
export const DELIVERY_HEADER = 'x-hrms-delivery';

// The exact Status tags the Notion database used. The workflow's Switch nodes
// compare against these strings today, so every payload carries the label next
// to the stage key and the callback accepts either form — the workflow can move
// over without rewriting its branches.
export const NOTION_STAGE_LABELS: Readonly<Record<OnboardingAutomationStage, string>> = {
  preOnboard: 'Pre-Onboard',
  offerLetterReview: 'Offer Letter - Review',
  offerLetterSent: 'Offer Letter - Sent',
  employeeRecordReview: 'Employee Record - Review',
  employeeRecordSent: 'Employee Record - Sent',
  contractLetterReview: 'Contract Letter - Review',
  contractLetterSent: 'Contract Letter - Sent',
  salaryLetterReview: 'Salary Letter - Review',
  salaryLetterGenerated: 'Salary Letter - Generated',
  completed: 'Active',
};

const STAGE_BY_LABEL = new Map<string, OnboardingAutomationStage>(
  ONBOARDING_AUTOMATION_STAGES.map((stage) => [
    NOTION_STAGE_LABELS[stage].toLowerCase(),
    stage,
  ]),
);

const isStage = (value: string): value is OnboardingAutomationStage =>
  (ONBOARDING_AUTOMATION_STAGES as readonly string[]).includes(value);

// Accepts a stage key ('offerLetterSent') or its Notion label
// ('Offer Letter - Sent', any case). Null when it is neither.
export const parseStage = (value: string): OnboardingAutomationStage | null => {
  const trimmed = value.trim();
  if (isStage(trimmed)) return trimmed;
  return STAGE_BY_LABEL.get(trimmed.toLowerCase()) ?? null;
};

export type OnboardingAutomationPayload = {
  readonly version: number;
  readonly event: 'onboarding.automation.requested';
  readonly runId: string;
  readonly requestedAt: string;
  readonly requestedByUserId: string | null;
  readonly workspace: { readonly organizationId: string; readonly name: string };
  readonly stage: OnboardingAutomationStage;
  readonly stageLabel: string;
  readonly employee: {
    readonly id: string;
    readonly employeeNumber: string;
    readonly fullName: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly personalEmail: string | null;
    readonly workEmail: string | null;
    readonly phone: string | null;
    readonly roleTitle: string | null;
    readonly startDate: string;
    readonly workerType: string;
    readonly probationEndDate: string | null;
    readonly noticePeriodDays: number | null;
    readonly documentsFolderUrl: string | null;
  };
  // The salary in force on the start date (or today, if later). Null when no
  // salary has been set up for the person yet.
  readonly compensation: {
    readonly currency: string;
    readonly annualAmount: number;
    readonly monthlyAmount: number;
    readonly effectiveFrom: string;
  } | null;
  readonly callback: { readonly url: string | null; readonly method: 'POST' };
};

export type PayloadSource = {
  readonly runId: string;
  readonly requestedAt: Date;
  readonly requestedByUserId: string | null;
  readonly organizationId: string;
  readonly workspaceName: string;
  readonly stage: OnboardingAutomationStage;
  readonly employee: {
    readonly id: string;
    readonly employeeNumber: string;
    readonly firstName: string;
    readonly middleName: string | null;
    readonly lastName: string;
    readonly workEmail: string | null;
    readonly roleTitle: string | null;
    readonly hireDate: string;
    readonly workerType: string;
    readonly probationEndDate: string | null;
    readonly noticePeriodDays: number | null;
  };
  readonly profile: { readonly personalEmail: string | null; readonly phone: string | null } | null;
  readonly documentsFolderUrl: string | null;
  readonly compensation: {
    readonly currency: string;
    readonly annualAmount: string;
    readonly validFrom: string;
  } | null;
  readonly publicApiUrl: string | null;
};

export const CALLBACK_PATH = '/automations/onboarding/callback';

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export const buildPayload = (source: PayloadSource): OnboardingAutomationPayload => {
  const { employee } = source;
  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ');
  const annualAmount = source.compensation ? Number(source.compensation.annualAmount) : null;
  return {
    version: PAYLOAD_VERSION,
    event: 'onboarding.automation.requested',
    runId: source.runId,
    requestedAt: source.requestedAt.toISOString(),
    requestedByUserId: source.requestedByUserId,
    workspace: { organizationId: source.organizationId, name: source.workspaceName },
    stage: source.stage,
    stageLabel: NOTION_STAGE_LABELS[source.stage],
    employee: {
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      fullName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      personalEmail: source.profile?.personalEmail ?? null,
      workEmail: employee.workEmail,
      phone: source.profile?.phone ?? null,
      roleTitle: employee.roleTitle,
      startDate: employee.hireDate,
      workerType: employee.workerType,
      probationEndDate: employee.probationEndDate,
      noticePeriodDays: employee.noticePeriodDays,
      documentsFolderUrl: source.documentsFolderUrl,
    },
    compensation:
      source.compensation && annualAmount !== null && Number.isFinite(annualAmount)
        ? {
            currency: source.compensation.currency,
            annualAmount: roundMoney(annualAmount),
            monthlyAmount: roundMoney(annualAmount / 12),
            effectiveFrom: source.compensation.validFrom,
          }
        : null,
    callback: {
      url: source.publicApiUrl ? `${source.publicApiUrl}${CALLBACK_PATH}` : null,
      method: 'POST',
    },
  };
};

// HMAC-SHA256 over the exact request body, hex encoded, GitHub-style prefix.
export const signBody = (secret: string, body: string): string =>
  `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

// Constant-time check of an `Authorization: Bearer <secret>` header.
export const isAuthorizedBearer = (header: string | undefined, secret: string): boolean => {
  if (!header) return false;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  const given = Buffer.from(match[1].trim());
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
};

const optionalUrl = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine((value) => /^https?:\/\//i.test(value), 'Must be an http(s) URL');

// What the workflow POSTs back when it finishes. Unknown fields are ignored so
// the workflow can send its whole item without trimming it first.
const callbackSchema = z.object({
  runId: z.string().uuid(),
  status: z.enum(['succeeded', 'failed']).default('succeeded'),
  stage: z.string().max(64).optional(),
  message: z.string().max(2000).optional(),
  documentUrl: optionalUrl.optional(),
  documentsFolderUrl: optionalUrl.optional(),
});

export type OnboardingAutomationCallback = {
  readonly runId: string;
  readonly status: 'succeeded' | 'failed';
  readonly stage: OnboardingAutomationStage | null;
  readonly message: string | null;
  readonly documentUrl: string | null;
  readonly documentsFolderUrl: string | null;
};

export type ParsedCallback =
  | { readonly ok: true; readonly value: OnboardingAutomationCallback }
  | { readonly ok: false; readonly error: string };

export const parseCallback = (body: unknown): ParsedCallback => {
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join('.') || 'body'}: ${issue.message}` };
  }
  const { stage: rawStage } = parsed.data;
  const stage = rawStage === undefined || rawStage.trim() === '' ? null : parseStage(rawStage);
  if (rawStage !== undefined && rawStage.trim() !== '' && stage === null) {
    return { ok: false, error: `stage: "${rawStage}" is not a known onboarding stage` };
  }
  return {
    ok: true,
    value: {
      runId: parsed.data.runId,
      status: parsed.data.status,
      stage,
      message: parsed.data.message?.trim() || null,
      documentUrl: parsed.data.documentUrl ?? null,
      documentsFolderUrl: parsed.data.documentsFolderUrl ?? null,
    },
  };
};
