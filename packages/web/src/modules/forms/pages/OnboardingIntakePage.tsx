import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { formatDateTime } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import {
  IconAlertTriangle,
  IconCopy,
  IconFilterOff,
  IconInbox,
  IconRefresh,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { StatusChip } from '../../../components/chip/StatusChip';
import { EmptyState } from '../../../components/empty-state/EmptyState';
import { Modal } from '../../../components/modal/Modal';
import { OnboardingReviewRow } from '../../../components/onboarding/OnboardingFlow';
import { FieldGroup } from '../../../components/record-panel/FieldGroup';
import { SidePanel } from '../../../components/side-panel/SidePanel';
import {
  DataTable,
  toViewColumns,
  type ColumnDefinition,
} from '../../../components/table/DataTable';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { useListView } from '../../../components/view-bar/useListView';
import { ViewBar } from '../../../components/view-bar/ViewBar';
import { useTheme } from '../../../providers/theme/useTheme';
import {
  CREATE_INTAKE_FORM_LINK_MUTATION,
  ENSURE_EMPLOYEE_INTAKE_FORM_MUTATION,
  INTAKE_FORM_DEFINITIONS_QUERY,
  INTAKE_FORM_SUBMISSIONS_QUERY,
  INTAKE_FORM_SUBMISSION_QUERY,
  INTAKE_FORM_TARGET,
  type IntakeFormDefinitionRecord,
  type IntakeFormLink,
  type IntakeSubmissionRecord,
  type IntakeSubmissionStatus,
} from '../graphql/intake.operations';
import {
  buildIntakeReviewGroups,
  groupIntakeFields,
  intakeAnswersByKey,
  intakeNewHireSummary,
} from '../intakeSteps';

const STATUS_COLORS: Readonly<Record<IntakeSubmissionStatus, MainColorName>> = {
  pending: 'amber',
  projected: 'green',
  rejected: 'red',
};

const STATUS_LABELS: Readonly<Record<IntakeSubmissionStatus, string>> = {
  pending: 'Pending',
  projected: 'Projected',
  rejected: 'Rejected',
};

const STATUS_FILTER_OPTIONS = (['pending', 'projected', 'rejected'] as const).map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

// Clipboard with a fallback: a dev API can sit behind plain http, where
// navigator.clipboard is undefined — and the link is shown inline regardless,
// so a failed copy is never a dead end.
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard !== undefined) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path rather than giving up.
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.opacity = '0';
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
};

// The Tethr-admin surface for the new-hire intake: mint a signed public form
// link (seeding the standard definition on first use), then watch what comes
// back — a submissions table with a side panel carrying the full answers.
export const OnboardingIntakePage = () => {
  const { theme } = useTheme();
  const definitionsQuery = useQuery<{
    readonly formDefinitions: readonly IntakeFormDefinitionRecord[];
  }>(INTAKE_FORM_DEFINITIONS_QUERY);
  const [ensureDefinition] = useMutation<{
    readonly ensureEmployeeIntakeFormDefinition: IntakeFormDefinitionRecord;
  }>(ENSURE_EMPLOYEE_INTAKE_FORM_MUTATION);
  const [createFormLink, { loading: minting }] = useMutation<{
    readonly createFormLink: IntakeFormLink;
  }>(CREATE_INTAKE_FORM_LINK_MUTATION);

  const definitions = definitionsQuery.data?.formDefinitions ?? [];
  const intakeForm =
    definitions.find((definition) => definition.target === INTAKE_FORM_TARGET) ?? null;
  const submissionsQuery = useQuery<{
    readonly formSubmissions: readonly IntakeSubmissionRecord[];
  }>(INTAKE_FORM_SUBMISSIONS_QUERY, {
    variables: { formId: intakeForm?.id ?? '' },
    skip: intakeForm === null,
    fetchPolicy: 'network-only',
  });
  const [loadDetail, { data: detailData, loading: detailLoading }] = useLazyQuery<{
    readonly formSubmission: IntakeSubmissionRecord;
  }>(INTAKE_FORM_SUBMISSION_QUERY, { fetchPolicy: 'network-only' });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mintedLink, setMintedLink] = useState<string | null>(null);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinkConfirmationOpen, setIsLinkConfirmationOpen] = useState(false);
  const view = useListView({ routeKey: '/onboarding-intake' });

  const submissions = submissionsQuery.data?.formSubmissions ?? [];
  const detail = detailData?.formSubmission ?? null;
  const detailFields = intakeForm?.fields ?? [];
  const detailGroups = groupIntakeFields(detailFields);

  const visibleSubmissions = submissions.filter((submission) => {
    const statuses = view.filters.status ?? [];
    if (statuses.length === 0) return true;
    return statuses.includes(submission.status);
  });

  const columns: readonly ColumnDefinition<IntakeSubmissionRecord>[] = [
    {
      key: 'newHire',
      header: 'New hire',
      width: '34%',
      hideable: false,
      sortValue: (submission) => intakeNewHireSummary(submission.answers, detailFields).name,
      render: (submission) => {
        const summary = intakeNewHireSummary(submission.answers, detailFields);
        return (
          <>
            <div className="employee-primary">{summary.name}</div>
            <div className="employee-secondary">{summary.email === '' ? '—' : summary.email}</div>
          </>
        );
      },
    },
    {
      key: 'submitted',
      header: 'Submitted',
      width: '18%',
      sortValue: (submission) => submission.submittedAt,
      render: (submission) => formatDateTime(submission.submittedAt),
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      sortValue: (submission) => submission.status,
      render: (submission) => (
        <StatusChip
          color={STATUS_COLORS[submission.status]}
          label={STATUS_LABELS[submission.status]}
        />
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      width: '34%',
      sortValue: (submission) => submission.statusReason ?? '',
      render: (submission) =>
        submission.statusReason === null ? (
          '—'
        ) : (
          <Tooltip label={submission.statusReason}>
            <span className="intake-reason">{submission.statusReason}</span>
          </Tooltip>
        ),
    },
  ];

  const onMintLink = async (): Promise<void> => {
    setLinkError(null);
    setLinkNotice(null);
    try {
      let formId = intakeForm?.id ?? null;
      if (formId === null) {
        // First use in this workspace: seed the standard definition. Idempotent
        // server-side; refetching the definitions also un-skips the submissions
        // query for the new form id.
        const ensured = await ensureDefinition();
        const ensuredForm = ensured.data?.ensureEmployeeIntakeFormDefinition ?? null;
        if (ensuredForm === null) throw new Error('Could not create the intake form');
        formId = ensuredForm.id;
        await definitionsQuery.refetch();
      }
      const link = await createFormLink({
        variables: { input: { formDefinitionId: formId } },
      });
      const created = link.data?.createFormLink ?? null;
      if (created === null) throw new Error('Could not create a form link');
      // createFormLink's path historically points at /apply; the intake link
      // is served by /onboarding. Trust the API when it already says
      // onboarding, otherwise build the intake path from the token.
      const path = created.path.startsWith('/onboarding/')
        ? created.path
        : `/onboarding/${created.token}`;
      const url = `${window.location.origin}${path}`;
      setMintedLink(url);
      const copied = await copyToClipboard(url);
      setLinkNotice(
        copied
          ? 'Link copied to clipboard.'
          : 'Could not copy automatically — select the link below and copy it.',
      );
      setIsLinkConfirmationOpen(true);
    } catch (caught) {
      setLinkError(caught instanceof Error ? caught.message : 'Could not create a form link');
    }
  };

  const onCopyLinkAgain = async (): Promise<void> => {
    if (mintedLink === null) return;
    const copied = await copyToClipboard(mintedLink);
    setLinkNotice(copied ? 'Copied' : null);
  };

  const openSubmission = (submission: IntakeSubmissionRecord): void => {
    setSelectedId(submission.id);
    void loadDetail({ variables: { id: submission.id } });
  };

  const definitionsError = definitionsQuery.error !== undefined;

  return (
    <>
      <section className="list-with-panel">
        <section aria-labelledby="onboarding-intake-title" className="onboarding-intake-content">
          <header className="page-header">
            <div>
              <h1 className="page-title" id="onboarding-intake-title">
                Onboarding intake
              </h1>
              <p className="page-subtitle">Mint new-hire form links and review what comes back.</p>
            </div>
            <div className="page-actions">
              {intakeForm === null ? null : (
                <Tooltip label="Refresh submissions">
                  <button
                    aria-label="Refresh submissions"
                    className="icon-button"
                    onClick={() => void submissionsQuery.refetch()}
                    type="button"
                  >
                    <IconRefresh
                      aria-hidden="true"
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.md}
                    />
                  </button>
                </Tooltip>
              )}
              <button
                className="button button-primary"
                disabled={minting}
                onClick={() => void onMintLink()}
                type="button"
              >
                <IconCopy
                  aria-hidden="true"
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.md}
                />
                {minting ? 'Preparing link…' : 'Copy new-hire form link'}
              </button>
            </div>
          </header>

          {linkError !== null ? (
            <p className="auth-error" role="alert">
              {linkError}
            </p>
          ) : null}

          <section aria-label="Submissions" className="table-shell">
            <ViewBar
              columns={toViewColumns(columns)}
              count={visibleSubmissions.length}
              filters={[{ key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS }]}
              view={view}
              viewLabel="All submissions"
            />
            <DataTable
              columns={columns}
              emptyState={
                definitionsError ? (
                  <EmptyState
                    description="Is the API running, and are you still signed in?"
                    icon={IconAlertTriangle}
                    title="Could not load the intake form"
                  />
                ) : intakeForm === null ? (
                  <EmptyState
                    description="Minting the first link creates the standard new-hire form definition."
                    icon={IconInbox}
                    title="No intake form yet"
                  />
                ) : submissions.length === 0 ? (
                  <EmptyState
                    description="Copy the form link and send it to the next new hire — submissions land here."
                    icon={IconInbox}
                    title="No submissions yet"
                  />
                ) : (
                  <EmptyState
                    description="Nothing matches the current status filter."
                    icon={IconFilterOff}
                    title="No submissions here"
                  />
                )
              }
              getRowKey={(submission) => submission.id}
              hiddenColumns={view.hiddenColumns}
              loading={(definitionsQuery.loading || submissionsQuery.loading) && !definitionsError}
              onHideColumn={view.hideColumn}
              onRowClick={openSubmission}
              onSort={view.setSort}
              rows={definitionsError ? [] : visibleSubmissions}
              selectedRowKey={selectedId}
              skeletonRows={4}
              sorts={view.sorts}
              tableClassName="data-table onboarding-intake-table"
            />
          </section>
        </section>

        <SidePanel
          ariaLabel={
            detail !== null
              ? `${intakeNewHireSummary(detail.answers, detailFields).name} submission`
              : 'Submission'
          }
          isOpen={selectedId !== null}
          onClose={() => setSelectedId(null)}
          title="Submission"
        >
          {detailLoading && detail === null ? (
            <p className="page-subtitle">Loading submission…</p>
          ) : detail === null ? (
            <p className="page-subtitle">This submission could not be found.</p>
          ) : (
            <section>
              <div className="panel-title-row">
                <div>
                  <div className="panel-kicker">Submitted {formatDateTime(detail.submittedAt)}</div>
                  <h2 className="panel-title">
                    {intakeNewHireSummary(detail.answers, detailFields).name}
                  </h2>
                </div>
                <StatusChip
                  color={STATUS_COLORS[detail.status]}
                  label={STATUS_LABELS[detail.status]}
                />
              </div>

              {buildIntakeReviewGroups(
                detailGroups,
                intakeAnswersByKey(detail.answers),
                Object.fromEntries(detail.files.map((file) => [file.fieldKey, file])),
              ).map((group) => (
                <FieldGroup key={group.key} title={group.title}>
                  {group.entries.map((entry) => (
                    <OnboardingReviewRow
                      key={entry.label}
                      label={entry.label}
                      value={entry.value}
                    />
                  ))}
                </FieldGroup>
              ))}

              <FieldGroup title="Processing">
                <OnboardingReviewRow label="Status" value={STATUS_LABELS[detail.status]} />
                <OnboardingReviewRow
                  label="Reason"
                  value={detail.statusReason === null ? '—' : detail.statusReason}
                />
                <div className="field-row">
                  <span className="field-label">Employee record</span>
                  <span className="field-value">
                    {detail.targetRefId !== null ? (
                      <Link className="table-link" to={`/employees/${detail.targetRefId}`}>
                        Open employee record
                      </Link>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </FieldGroup>
            </section>
          )}
        </SidePanel>
      </section>
      <Modal
        footer={
          <button
            className="button button-primary"
            onClick={() => setIsLinkConfirmationOpen(false)}
            type="button"
          >
            Done
          </button>
        }
        isOpen={isLinkConfirmationOpen}
        title="Your new-hire form link is ready"
        onClose={() => setIsLinkConfirmationOpen(false)}
      >
        <div className="intake-link-confirmation" role="status">
          {mintedLink !== null ? (
            <div className="intake-link-confirmation-controls">
              <input
                className="intake-link-input"
                id="intake-form-link-confirmation"
                name="intake-form-link-confirmation"
                readOnly
                spellCheck={false}
                value={mintedLink}
                onFocus={(event) => event.currentTarget.select()}
              />
              <button
                className="button button-secondary"
                onClick={() => void onCopyLinkAgain()}
                type="button"
              >
                {linkNotice !== null ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          ) : null}
          <p>Anyone with this link can complete the form. Send it privately to the new hire.</p>
        </div>
      </Modal>
    </>
  );
};
