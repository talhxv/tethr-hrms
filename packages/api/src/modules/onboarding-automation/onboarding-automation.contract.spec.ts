import { createHmac } from 'node:crypto';

import { ONBOARDING_AUTOMATION_STAGES } from '@hrms/shared';

import {
  buildPayload,
  isAuthorizedBearer,
  NOTION_STAGE_LABELS,
  parseCallback,
  parseStage,
  signBody,
  type PayloadSource,
} from './onboarding-automation.contract';

const SECRET = 's'.repeat(40);
const RUN_ID = '8a6b7b0e-6f6b-4f1e-9a51-3f4f0c2d1e11';

const source = (overrides: Partial<PayloadSource> = {}): PayloadSource => ({
  runId: RUN_ID,
  requestedAt: new Date('2026-11-25T10:00:00.000Z'),
  requestedByUserId: 'user-1',
  organizationId: 'org-1',
  workspaceName: 'Tethr',
  stage: 'offerLetterReview',
  employee: {
    id: 'employee-1',
    employeeNumber: 'TTR-099',
    firstName: 'Alex',
    middleName: null,
    lastName: 'Morgan',
    workEmail: null,
    roleTitle: 'Product Engineer',
    hireDate: '2026-12-01',
    workerType: 'permanent',
    probationEndDate: '2027-03-01',
    noticePeriodDays: 30,
  },
  profile: { personalEmail: 'alex@example.com', phone: '+92 300 0000000' },
  documentsFolderUrl: 'https://drive.google.com/drive/folders/abc',
  compensation: { currency: 'PKR', annualAmount: '1800000.00', validFrom: '2026-12-01' },
  publicApiUrl: 'https://api.example.com',
  ...overrides,
});

describe('onboarding automation contract', () => {
  it('labels every stage with the Notion status the workflow already branches on', () => {
    for (const stage of ONBOARDING_AUTOMATION_STAGES) {
      expect(NOTION_STAGE_LABELS[stage]).toEqual(expect.any(String));
    }
    expect(NOTION_STAGE_LABELS.offerLetterReview).toBe('Offer Letter - Review');
    expect(NOTION_STAGE_LABELS.contractLetterSent).toBe('Contract Letter - Sent');
  });

  it('parses a stage from its key or its Notion label', () => {
    expect(parseStage('employeeRecordSent')).toBe('employeeRecordSent');
    expect(parseStage('Employee Record - Sent')).toBe('employeeRecordSent');
    expect(parseStage('  offer letter - review ')).toBe('offerLetterReview');
    expect(parseStage('Offer Letter Sent')).toBeNull();
  });

  it('builds the payload the workflow reads', () => {
    const payload = buildPayload(source());
    expect(payload).toMatchObject({
      version: 1,
      event: 'onboarding.automation.requested',
      runId: RUN_ID,
      stage: 'offerLetterReview',
      stageLabel: 'Offer Letter - Review',
      workspace: { organizationId: 'org-1', name: 'Tethr' },
      employee: {
        fullName: 'Alex Morgan',
        personalEmail: 'alex@example.com',
        startDate: '2026-12-01',
        documentsFolderUrl: 'https://drive.google.com/drive/folders/abc',
      },
      compensation: {
        currency: 'PKR',
        annualAmount: 1_800_000,
        monthlyAmount: 150_000,
        effectiveFrom: '2026-12-01',
      },
      callback: { url: 'https://api.example.com/automations/onboarding/callback', method: 'POST' },
    });
    expect(payload.requestedAt).toBe('2026-11-25T10:00:00.000Z');
  });

  it('leaves salary and callback empty when they are not known', () => {
    const payload = buildPayload(source({ compensation: null, publicApiUrl: null, profile: null }));
    expect(payload.compensation).toBeNull();
    expect(payload.callback.url).toBeNull();
    expect(payload.employee.personalEmail).toBeNull();
  });

  it('signs the exact body with HMAC-SHA256', () => {
    const body = JSON.stringify({ hello: 'world' });
    const expected = createHmac('sha256', SECRET).update(body).digest('hex');
    expect(signBody(SECRET, body)).toBe(`sha256=${expected}`);
  });

  it('accepts only the exact bearer secret', () => {
    expect(isAuthorizedBearer(`Bearer ${SECRET}`, SECRET)).toBe(true);
    expect(isAuthorizedBearer(`bearer   ${SECRET}`, SECRET)).toBe(true);
    expect(isAuthorizedBearer(`Bearer ${SECRET}x`, SECRET)).toBe(false);
    expect(isAuthorizedBearer(SECRET, SECRET)).toBe(false);
    expect(isAuthorizedBearer(undefined, SECRET)).toBe(false);
  });

  it('reads a callback, accepting Notion labels and ignoring extra fields', () => {
    const parsed = parseCallback({
      runId: RUN_ID,
      stage: 'Offer Letter - Sent',
      documentUrl: 'https://docs.google.com/document/d/xyz',
      somethingN8nAdded: true,
    });
    expect(parsed).toEqual({
      ok: true,
      value: {
        runId: RUN_ID,
        status: 'succeeded',
        stage: 'offerLetterSent',
        message: null,
        documentUrl: 'https://docs.google.com/document/d/xyz',
        documentsFolderUrl: null,
      },
    });
  });

  it('rejects a callback with an unknown stage or a bad run id', () => {
    expect(parseCallback({ runId: RUN_ID, stage: 'Signed' })).toMatchObject({ ok: false });
    expect(parseCallback({ runId: 'not-a-uuid' })).toMatchObject({ ok: false });
    expect(parseCallback(null)).toMatchObject({ ok: false });
  });

  it('reports a failure without moving the stage', () => {
    const parsed = parseCallback({ runId: RUN_ID, status: 'failed', message: 'Template missing' });
    expect(parsed).toMatchObject({
      ok: true,
      value: { status: 'failed', stage: null, message: 'Template missing' },
    });
  });
});
