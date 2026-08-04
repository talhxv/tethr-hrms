import { useMutation, useQuery } from '@apollo/client';
import type { HiringRequestStatus } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import {
  IconBriefcase,
  IconClipboardCheck,
  IconMessageCircle,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  CREATE_HIRING_REQUEST_MUTATION,
  HIRING_REQUESTS_QUERY,
  UPDATE_HIRING_REQUEST_MUTATION,
} from '../graphql/recruitment.operations';

type HiringRequestRecord = {
  readonly id: string;
  readonly positionTitle: string;
  readonly headcount: number;
  readonly employmentType: string;
  readonly location: string | null;
  readonly preferredStartDate: string | null;
  readonly clientNote: string | null;
  readonly tethrNote: string | null;
  readonly status: HiringRequestStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updates: readonly HiringRequestUpdateRecord[];
};

type HiringRequestUpdateRecord = {
  readonly id: string;
  readonly hiringRequestId: string;
  readonly status: HiringRequestStatus;
  readonly actor: string;
  readonly note: string | null;
  readonly createdByUserId: string;
  readonly createdAt: string;
};

type HiringRequestsData = { readonly hiringRequests: readonly HiringRequestRecord[] };

const statuses: readonly HiringRequestStatus[] = [
  'submitted',
  'inReview',
  'sourcing',
  'interviewing',
  'offer',
  'filled',
  'cancelled',
];

const statusLabels: Record<HiringRequestStatus, string> = {
  submitted: 'Submitted',
  inReview: 'In review',
  sourcing: 'Sourcing',
  interviewing: 'Interviewing',
  offer: 'Offer',
  filled: 'Filled',
  cancelled: 'Cancelled',
};

const statusColors: Record<HiringRequestStatus, MainColorName> = {
  submitted: 'blue',
  inReview: 'violet',
  sourcing: 'cyan',
  interviewing: 'amber',
  offer: 'plum',
  filled: 'green',
  cancelled: 'gray',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const chipStyle = (color: MainColorName): CSSProperties & { readonly '--chip-color': string } => ({
  '--chip-color': `var(--hrms-color-tag-${color})`,
});

const updateActorLabel = (actor: string): string => (actor === 'client' ? 'Client' : 'Tethr');

const emptyRequest = {
  positionTitle: '',
  headcount: '1',
  employmentType: 'permanent',
  location: '',
  preferredStartDate: '',
  clientNote: '',
};

export const HiringRequestsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isTethr = user?.portal === 'tethr';
  const { data, loading, error, refetch } = useQuery<HiringRequestsData>(HIRING_REQUESTS_QUERY);
  const [createRequest, { loading: creating }] = useMutation(CREATE_HIRING_REQUEST_MUTATION);
  const [updateRequest, { loading: updating }] = useMutation(UPDATE_HIRING_REQUEST_MUTATION);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [formError, setFormError] = useState<string | null>(null);
  const requests = useMemo(() => data?.hiringRequests ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = requests.find((request) => request.id === selectedId) ?? requests[0] ?? null;
  const [updateForm, setUpdateForm] = useState({
    status: 'submitted' as HiringRequestStatus,
    tethrNote: '',
  });
  const selectedRequestId = selected?.id ?? null;
  const selectedStatus = selected?.status ?? null;
  const selectedTethrNote = selected?.tethrNote ?? null;

  useEffect(() => {
    if (!selectedRequestId || !selectedStatus) return;
    setUpdateForm({ status: selectedStatus, tethrNote: selectedTethrNote ?? '' });
  }, [selectedRequestId, selectedStatus, selectedTethrNote]);

  const onCreate = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    try {
      await createRequest({
        variables: {
          input: {
            positionTitle: requestForm.positionTitle,
            headcount: Number(requestForm.headcount),
            employmentType: requestForm.employmentType,
            location: requestForm.location || undefined,
            preferredStartDate: requestForm.preferredStartDate || undefined,
            clientNote: requestForm.clientNote || undefined,
          },
        },
      });
      setRequestForm(emptyRequest);
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not submit hiring request');
    }
  };

  const selectRequest = (request: HiringRequestRecord): void => {
    setSelectedId(request.id);
    setUpdateForm({ status: request.status, tethrNote: request.tethrNote ?? '' });
  };

  const onUpdate = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!selected) return;
    await updateRequest({
      variables: {
        input: {
          hiringRequestId: selected.id,
          status: updateForm.status,
          tethrNote: updateForm.tethrNote || null,
        },
      },
    });
    await refetch();
  };

  const renderUpdateTrail = (request: HiringRequestRecord) => (
    <section className="hiring-update-trail" aria-label="Hiring request updates">
      <div className="table-density">
        {request.updates.length} update{request.updates.length === 1 ? '' : 's'}
      </div>
      <div className="record-list">
        {request.updates.map((update) => (
          <div className="record-item" key={update.id}>
            <IconMessageCircle size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            <div>
              <div className="record-inline-actions">
                <span className="chip" style={chipStyle(statusColors[update.status])}>
                  <span className="chip-dot" />
                  {statusLabels[update.status]}
                </span>
                <span className="employee-secondary">
                  {updateActorLabel(update.actor)} · {formatDateTime(update.createdAt)}
                </span>
              </div>
              <div className="leave-trail-note">{update.note ?? 'No update note.'}</div>
            </div>
          </div>
        ))}
        {request.updates.length === 0 ? (
          <p className="table-empty">No recruitment updates have been recorded yet.</p>
        ) : null}
      </div>
    </section>
  );

  return (
    <main className="hiring-page">
      <section className="hiring-content" aria-labelledby="hiring-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="hiring-title">
              Hiring requests
            </h1>
            <p className="page-subtitle">
              Client demand and Tethr recruitment progress in one workflow.
            </p>
          </div>
        </header>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconBriefcase size={theme.icon.size.md} />
              Requests
            </div>
            <button
              className="icon-button"
              onClick={() => void refetch()}
              title="Refresh requests"
              type="button"
            >
              <IconRefresh size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
          </div>
          {error ? (
            <p className="table-empty">Could not load hiring requests.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table hiring-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Headcount</th>
                    <th>Location</th>
                    <th>Target start</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      className={selected?.id === request.id ? 'is-selected' : ''}
                      key={request.id}
                      onClick={() => selectRequest(request)}
                    >
                      <td>
                        <div className="employee-primary">{request.positionTitle}</div>
                        <div className="employee-secondary">{request.employmentType}</div>
                      </td>
                      <td>{request.headcount}</td>
                      <td>{request.location ?? '—'}</td>
                      <td>
                        {request.preferredStartDate ? formatDate(request.preferredStartDate) : '—'}
                      </td>
                      <td>
                        <span className="chip" style={chipStyle(statusColors[request.status])}>
                          <span className="chip-dot" />
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td>{formatDate(request.updatedAt)}</td>
                    </tr>
                  ))}
                  {!loading && requests.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={6}>
                        No hiring requests yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <aside
        className="hiring-panel"
        aria-label={isTethr ? 'Manage hiring request' : 'Submit hiring request'}
      >
        {isTethr ? (
          selected ? (
            <section>
              <div className="panel-title-row">
                <div>
                  <div className="panel-kicker">Recruitment update</div>
                  <h2 className="panel-title">{selected.positionTitle}</h2>
                </div>
                <IconClipboardCheck size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
              </div>
              {renderUpdateTrail(selected)}
              <form className="config-form" onSubmit={onUpdate}>
                <div className="field">
                  <label htmlFor="request-status">Status</label>
                  <select
                    id="request-status"
                    value={updateForm.status}
                    onChange={(event) =>
                      setUpdateForm((current) => ({
                        ...current,
                        status: event.target.value as HiringRequestStatus,
                      }))
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="tethr-note">Client update</label>
                  <textarea
                    id="tethr-note"
                    value={updateForm.tethrNote}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, tethrNote: event.target.value }))
                    }
                  />
                </div>
                <section className="request-note">
                  <div className="field-label">Client brief</div>
                  <p>{selected.clientNote ?? 'No additional detail provided.'}</p>
                </section>
                <button className="button button-primary" disabled={updating} type="submit">
                  {updating ? 'Saving...' : 'Save update'}
                </button>
              </form>
            </section>
          ) : (
            <p className="table-empty">Select a request to publish a recruitment update.</p>
          )
        ) : (
          <section>
            {selected ? (
              <>
                <div className="panel-title-row">
                  <div>
                    <div className="panel-kicker">Recruitment updates</div>
                    <h2 className="panel-title">{selected.positionTitle}</h2>
                  </div>
                  <IconBriefcase size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
                </div>
                {renderUpdateTrail(selected)}
              </>
            ) : null}
            <div className="panel-title-row">
              <div>
                <div className="panel-kicker">New request</div>
                <h2 className="panel-title">Request a hire</h2>
              </div>
              <IconPlus size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
            </div>
            <form className="config-form" onSubmit={onCreate}>
              {formError ? (
                <p className="auth-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="field">
                <label htmlFor="role-title">Role title</label>
                <input
                  id="role-title"
                  required
                  value={requestForm.positionTitle}
                  onChange={(event) =>
                    setRequestForm((current) => ({ ...current, positionTitle: event.target.value }))
                  }
                />
              </div>
              <div className="field-group">
                <div className="field">
                  <label htmlFor="headcount">Headcount</label>
                  <input
                    id="headcount"
                    min="1"
                    required
                    type="number"
                    value={requestForm.headcount}
                    onChange={(event) =>
                      setRequestForm((current) => ({ ...current, headcount: event.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="employment-type">Employment type</label>
                  <select
                    id="employment-type"
                    value={requestForm.employmentType}
                    onChange={(event) =>
                      setRequestForm((current) => ({
                        ...current,
                        employmentType: event.target.value,
                      }))
                    }
                  >
                    <option value="permanent">Permanent</option>
                    <option value="fixedTerm">Fixed term</option>
                    <option value="contractor">Contractor</option>
                    <option value="intern">Intern</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
              </div>
              <div className="field-group">
                <div className="field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    value={requestForm.location}
                    onChange={(event) =>
                      setRequestForm((current) => ({ ...current, location: event.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="target-date">Target start</label>
                  <input
                    id="target-date"
                    type="date"
                    value={requestForm.preferredStartDate}
                    onChange={(event) =>
                      setRequestForm((current) => ({
                        ...current,
                        preferredStartDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="client-note">Role brief</label>
                <textarea
                  id="client-note"
                  value={requestForm.clientNote}
                  onChange={(event) =>
                    setRequestForm((current) => ({ ...current, clientNote: event.target.value }))
                  }
                />
              </div>
              <button className="button button-primary" disabled={creating} type="submit">
                {creating ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </section>
        )}
      </aside>
    </main>
  );
};
