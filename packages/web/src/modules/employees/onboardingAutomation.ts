import {
  ONBOARDING_AUTOMATION_STAGES,
  type OnboardingAutomationRunStatus,
  type OnboardingAutomationStage,
} from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';

// The document pipeline, in order. Each document has a review step (drafted,
// HR checks it) and a sent step — the same tags the Notion board used.
export const onboardingStageLabels: Record<OnboardingAutomationStage, string> = {
  preOnboard: 'Pre-onboarding',
  offerLetterReview: 'Offer letter · review',
  offerLetterSent: 'Offer letter · sent',
  employeeRecordReview: 'Employee record · review',
  employeeRecordSent: 'Employee record · sent',
  contractLetterReview: 'Contract letter · review',
  contractLetterSent: 'Contract letter · sent',
  salaryLetterReview: 'Salary letter · review',
  salaryLetterGenerated: 'Salary letter · generated',
  completed: 'Onboarded',
};

export const onboardingStageColor = (stage: OnboardingAutomationStage): MainColorName => {
  if (stage === 'completed') return 'green';
  if (stage === 'preOnboard') return 'gray';
  return stage.endsWith('Review') ? 'orange' : 'blue';
};

export const onboardingStages: readonly OnboardingAutomationStage[] = ONBOARDING_AUTOMATION_STAGES;

export const isOnboardingStage = (value: string): value is OnboardingAutomationStage =>
  (ONBOARDING_AUTOMATION_STAGES as readonly string[]).includes(value);

export const runStatusLabels: Record<OnboardingAutomationRunStatus, string> = {
  queued: 'Starting',
  delivered: 'Running',
  succeeded: 'Done',
  failed: 'Failed',
};

export const runStatusColors: Record<OnboardingAutomationRunStatus, MainColorName> = {
  queued: 'gray',
  delivered: 'blue',
  succeeded: 'green',
  failed: 'red',
};

export const isRunInProgress = (status: string): boolean =>
  status === 'queued' || status === 'delivered';

// The API origin the browser already talks to, for showing the callback address.
export const apiOrigin = (): string => {
  const graphqlUrl: string = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql';
  try {
    return new URL(graphqlUrl).origin;
  } catch {
    return graphqlUrl.replace(/\/graphql\/?$/, '');
  }
};
