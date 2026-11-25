import { useMutation } from '@apollo/client';
import { formatDateTime, type OnboardingAutomationRunStatus, type OnboardingAutomationStage } from '@hrms/shared';
import { IconExternalLink, IconPlayerPlay, IconRobot } from '@tabler/icons-react';
import { useEffect, useState, type FormEvent } from 'react';

import { useQuery } from '../../../app/apollo-hooks';
import { StatusChip } from '../../../components/chip/StatusChip';
import { useConfirm } from '../../../components/confirm/ConfirmProvider';
import { useTheme } from '../../../providers/theme/useTheme';
import {
  EMPLOYEE_ONBOARDING_AUTOMATION_QUERY,
  RUN_ONBOARDING_AUTOMATION_MUTATION,
  SET_EMPLOYEE_ONBOARDING_STAGE_MUTATION,
} from '../graphql/onboarding-automation.operations';
import {
  isOnboardingStage,
  isRunInProgress,
  onboardingStageColor,
  onboardingStageLabels,
  onboardingStages,
  runStatusColors,
  runStatusLabels,
} from '../onboardingAutomation';

import { DetailSection } from './DetailSection';

type OnboardingAutomationRun = {
  readonly id: string;
  readonly stage: string;
  readonly status: OnboardingAutomationRunStatus;
  readonly resultStage: string | null;
  readonly documentUrl: string | null;
  readonly message: string | null;
  readonly createdAt: string;
  readonly completedAt: string | null;
};

type OnboardingAutomationData = {
  readonly employeeOnboardingStage: {
    readonly stage: string;
    readonly documentsFolderUrl: string | null;
    readonly updatedAt: string | null;
  };
  readonly onboardingAutomationRuns: readonly OnboardingAutomationRun[];
};

const POLL_MS = 3000;

const stageLabel = (value: string | null): string =>
  value && isOnboardingStage(value) ? onboardingStageLabels[value] : (value ?? '—');

const errorMessage = (cause: unknown, fallback: string): string =>
  cause instanceof Error && cause.message ? cause.message : fallback;

type OnboardingAutomationSectionProps = {
  readonly employeeId: string;
  readonly employeeName: string;
};

/**
 * The document pipeline that used to live on the Notion board: where this
 * person is (offer letter → employee record → contract → salary letter), a
 * "Run automation" button that hands the current step to the n8n workflow, and
 * what each run did. While a run is in flight the panel polls until the
 * workflow reports back.
 */
export const OnboardingAutomationSection = ({
  employeeId,
  employeeName,
}: OnboardingAutomationSectionProps) => {
  const { theme } = useTheme();
  const confirm = useConfirm();
  const { data, loading, startPolling, stopPolling, refetch } =
    useQuery<OnboardingAutomationData>(EMPLOYEE_ONBOARDING_AUTOMATION_QUERY, {
      variables: { employeeId },
      notifyOnNetworkStatusChange: false,
    });
  const [setStage, { loading: savingStage }] = useMutation(SET_EMPLOYEE_ONBOARDING_STAGE_MUTATION);
  const [runAutomation, { loading: starting }] = useMutation(RUN_ONBOARDING_AUTOMATION_MUTATION);
  const [stageDraft, setStageDraft] = useState<OnboardingAutomationStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const rawStage = data?.employeeOnboardingStage.stage ?? 'preOnboard';
  const currentStage: OnboardingAutomationStage = isOnboardingStage(rawStage) ? rawStage : 'preOnboard';
  const runs = data?.onboardingAutomationRuns ?? [];
  const latestRun = runs[0] ?? null;
  const running = latestRun !== null && isRunInProgress(latestRun.status);
  const selectedStage = stageDraft ?? currentStage;
  const folderUrl = data?.employeeOnboardingStage.documentsFolderUrl ?? null;

  useEffect(() => {
    if (running) {
      startPolling(POLL_MS);
      return () => stopPolling();
    }
    stopPolling();
    return undefined;
  }, [running, startPolling, stopPolling]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const onSaveStage = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (selectedStage === currentStage) return;
    setError(null);
    try {
      await setStage({ variables: { input: { employeeId, stage: selectedStage } } });
      await refetch();
      setStageDraft(null);
      setNotice('Stage updated.');
    } catch (cause) {
      setError(errorMessage(cause, 'Could not update the stage.'));
    }
  };

  const onRun = async (): Promise<void> => {
    const confirmed = await confirm({
      title: 'Run onboarding automation?',
      body: `The workflow will act on ${employeeName}’s current stage: ${onboardingStageLabels[currentStage]}. At a “sent” step this can email them.`,
      confirmLabel: 'Run automation',
    });
    if (!confirmed) return;
    setError(null);
    try {
      await runAutomation({ variables: { employeeId } });
      await refetch();
      setNotice('Automation started.');
    } catch (cause) {
      setError(errorMessage(cause, 'Could not start the automation.'));
    }
  };

  return (
    <DetailSection
      badge={
        <StatusChip color={onboardingStageColor(currentStage)} label={onboardingStageLabels[currentStage]} />
      }
      title="Onboarding automation"
    >
      {loading ? <p className="page-subtitle">Loading onboarding automation…</p> : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="form-success" role="status">
          {notice}
        </p>
      ) : null}

      <div className="onboarding-automation">
        <div className="onboarding-automation-run">
          <div>
            <div className="employee-primary">Next run acts on: {onboardingStageLabels[currentStage]}</div>
            <div className="employee-secondary">
              The workflow decides the step — draft the letter at a review stage, send it at the next
              — and reports the new stage back here.
            </div>
          </div>
          <button
            className="button button-primary"
            disabled={running || starting || loading}
            type="button"
            onClick={() => void onRun()}
          >
            <IconPlayerPlay aria-hidden="true" size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
            {running ? 'Running…' : starting ? 'Starting…' : 'Run automation'}
          </button>
        </div>

        <form className="onboarding-automation-stage" onSubmit={(event) => void onSaveStage(event)}>
          <div className="field">
            <label htmlFor={`onboarding-stage-${employeeId}`}>Stage</label>
            <select
              id={`onboarding-stage-${employeeId}`}
              name="onboarding-stage"
              value={selectedStage}
              onChange={(event) => {
                const value = event.target.value;
                if (isOnboardingStage(value)) setStageDraft(value);
              }}
            >
              {onboardingStages.map((stage) => (
                <option key={stage} value={stage}>
                  {onboardingStageLabels[stage]}
                </option>
              ))}
            </select>
          </div>
          <button
            className="button button-secondary"
            disabled={selectedStage === currentStage || savingStage}
            type="submit"
          >
            {savingStage ? 'Saving…' : 'Set stage'}
          </button>
          {folderUrl ? (
            <a className="button button-secondary" href={folderUrl} rel="noreferrer" target="_blank">
              <IconExternalLink aria-hidden="true" size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
              Documents folder
            </a>
          ) : null}
        </form>

        {runs.length > 0 ? (
          <div className="record-list" aria-label="Automation runs">
            {runs.map((run) => (
              <div className="record-item" key={run.id}>
                <IconRobot aria-hidden="true" size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                <div>
                  <div className="record-inline-actions">
                    <StatusChip color={runStatusColors[run.status]} label={runStatusLabels[run.status]} />
                    <span className="employee-primary">
                      {stageLabel(run.stage)}
                      {run.resultStage && run.resultStage !== run.stage
                        ? ` → ${stageLabel(run.resultStage)}`
                        : ''}
                    </span>
                  </div>
                  <div className="employee-secondary">
                    {formatDateTime(run.createdAt)}
                    {run.message ? ` · ${run.message}` : ''}
                  </div>
                  {run.documentUrl ? (
                    <a className="link" href={run.documentUrl} rel="noreferrer" target="_blank">
                      Open document
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <p className="employee-secondary">No automation runs yet.</p>
        ) : null}
      </div>
    </DetailSection>
  );
};
