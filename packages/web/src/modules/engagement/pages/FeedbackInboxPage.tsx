import { useMutation, useQuery } from '@apollo/client';
import type { FeedbackStatus } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import { IconCheck, IconMessageCircle } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { FEEDBACK_INBOX_QUERY, RESOLVE_FEEDBACK_MUTATION } from '../graphql/engagement.operations';

type FeedbackRecord = {
  readonly id: string;
  readonly employeeId: string;
  readonly category: string;
  readonly subject: string;
  readonly body: string;
  readonly status: FeedbackStatus;
  readonly resolutionNote: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type FeedbackData = { readonly employeeFeedback: readonly FeedbackRecord[] };

const statusLabel: Record<FeedbackStatus, string> = {
  submitted: 'Submitted',
  inReview: 'In review',
  resolved: 'Resolved',
};

const statusColor: Record<FeedbackStatus, MainColorName> = {
  submitted: 'amber',
  inReview: 'blue',
  resolved: 'green',
};

const chipStyle = (color: MainColorName): CSSProperties & { readonly '--chip-color': string } => ({
  '--chip-color': `var(--hrms-color-tag-${color})`,
});

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const FeedbackInboxPage = () => {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useQuery<FeedbackData>(FEEDBACK_INBOX_QUERY);
  const [resolveFeedback, { loading: resolving }] = useMutation(RESOLVE_FEEDBACK_MUTATION);
  const feedback = useMemo(() => data?.employeeFeedback ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = feedback.find((item) => item.id === selectedId) ?? feedback[0] ?? null;
  const [status, setStatus] = useState<FeedbackStatus>('submitted');
  const [resolutionNote, setResolutionNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setResolutionNote(selected.resolutionNote ?? '');
  }, [selected]);

  const onResolve = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!selected) return;
    setFormError(null);
    try {
      await resolveFeedback({
        variables: {
          input: {
            employeeFeedbackId: selected.id,
            status,
            resolutionNote: resolutionNote || null,
          },
        },
      });
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not update feedback');
    }
  };

  return (
    <main className="feedback-page">
      <section className="feedback-content" aria-labelledby="feedback-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="feedback-title">
              Employee feedback
            </h1>
            <p className="page-subtitle">Employee-submitted feedback for Tethr review.</p>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Open</div>
            <div className="metric-value">
              {loading ? '...' : feedback.filter((item) => item.status !== 'resolved').length}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Resolved</div>
            <div className="metric-value">
              {loading ? '...' : feedback.filter((item) => item.status === 'resolved').length}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total</div>
            <div className="metric-value">{loading ? '...' : feedback.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Selected</div>
            <div className="metric-value">{selected ? selected.status : '-'}</div>
          </div>
        </div>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconMessageCircle size={theme.icon.size.md} /> Inbox
            </div>
            <div className="table-density">
              {feedback.length} item{feedback.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table feedback-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Could not load feedback.
                    </td>
                  </tr>
                ) : null}
                {!error && feedback.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {loading ? 'Loading feedback...' : 'No employee feedback yet.'}
                    </td>
                  </tr>
                ) : null}
                {feedback.map((item) => (
                  <tr
                    className={item.id === selected?.id ? 'is-selected' : ''}
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>
                      <div className="employee-primary">{item.subject}</div>
                      <div className="employee-secondary">{item.employeeId}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span className="chip" style={chipStyle(statusColor[item.status])}>
                        <span className="chip-dot" />
                        {statusLabel[item.status]}
                      </span>
                    </td>
                    <td>{formatDateTime(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="feedback-panel" aria-label="Feedback triage">
        {selected ? (
          <section className="self-service-section">
            <div className="panel-title-row">
              <div>
                <div className="panel-kicker">{selected.category}</div>
                <h2 className="panel-title">{selected.subject}</h2>
              </div>
              <IconMessageCircle size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
            </div>
            <div className="request-note">
              <div className="employee-secondary">{formatDateTime(selected.createdAt)}</div>
              <p>{selected.body}</p>
            </div>
            <form className="config-form" onSubmit={onResolve}>
              {formError ? (
                <p className="auth-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="field">
                <label htmlFor="feedback-status">Status</label>
                <select
                  id="feedback-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as FeedbackStatus)}
                >
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="feedback-resolution">Resolution note</label>
                <textarea
                  id="feedback-resolution"
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                />
              </div>
              <button className="button button-primary" disabled={resolving} type="submit">
                <IconCheck size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                {resolving ? 'Saving...' : 'Save status'}
              </button>
            </form>
          </section>
        ) : (
          <section className="self-service-section">
            <div className="panel-kicker">Feedback</div>
            <p className="page-subtitle">Select a feedback item to review it.</p>
          </section>
        )}
      </aside>
    </main>
  );
};
