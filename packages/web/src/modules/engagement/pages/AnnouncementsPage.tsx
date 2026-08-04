import { useMutation, useQuery } from '@apollo/client';
import type { AnnouncementAudience } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import { IconDeviceFloppy, IconPin, IconSpeakerphone } from '@tabler/icons-react';
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  ANNOUNCEMENTS_QUERY,
  PUBLISH_ANNOUNCEMENT_MUTATION,
} from '../graphql/engagement.operations';

type AnnouncementRecord = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly audience: AnnouncementAudience;
  readonly isPinned: boolean;
  readonly publishedAt: string;
  readonly expiresAt: string | null;
};

type AnnouncementsData = { readonly announcements: readonly AnnouncementRecord[] };

type AnnouncementForm = {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isPinned: boolean;
  expiresAt: string;
};

const emptyForm: AnnouncementForm = {
  title: '',
  body: '',
  audience: 'all',
  isPinned: false,
  expiresAt: '',
};

const audienceLabel: Record<AnnouncementAudience, string> = {
  all: 'All portals',
  tethr: 'Tethr',
  client: 'Clients',
  employee: 'Employees',
};

const audienceColor: Record<AnnouncementAudience, MainColorName> = {
  all: 'blue',
  tethr: 'violet',
  client: 'green',
  employee: 'amber',
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

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const AnnouncementsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const canPublish = user?.portal === 'tethr';
  const { data, loading, error, refetch } = useQuery<AnnouncementsData>(ANNOUNCEMENTS_QUERY);
  const [publishAnnouncement, { loading: publishing }] = useMutation(PUBLISH_ANNOUNCEMENT_MUTATION);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const announcements = useMemo(() => data?.announcements ?? [], [data]);
  const pinnedCount = announcements.filter((announcement) => announcement.isPinned).length;

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setNotice(null);
    setFormError(null);
    try {
      await publishAnnouncement({
        variables: {
          input: {
            title: form.title.trim(),
            body: form.body.trim(),
            audience: form.audience,
            isPinned: form.isPinned,
            expiresAt: form.expiresAt || null,
          },
        },
      });
      setForm(emptyForm);
      setNotice('Announcement published');
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not publish announcement');
    }
  };

  return (
    <main className="announcements-page">
      <section className="announcements-content" aria-labelledby="announcements-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="announcements-title">
              News bulletin
            </h1>
            <p className="page-subtitle">Pinned and recent updates for this workspace.</p>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Visible posts</div>
            <div className="metric-value">{loading ? '...' : announcements.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Pinned</div>
            <div className="metric-value">{loading ? '...' : pinnedCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Portal</div>
            <div className="metric-value">{user?.portal ?? 'none'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Access</div>
            <div className="metric-value">{canPublish ? 'Publish' : 'Read'}</div>
          </div>
        </div>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconSpeakerphone size={theme.icon.size.md} /> Announcements
            </div>
            <div className="table-density">
              {announcements.length} update{announcements.length === 1 ? '' : 's'}
            </div>
          </div>
          {error ? <p className="table-empty">Could not load announcements.</p> : null}
          {!error && announcements.length === 0 ? (
            <p className="table-empty">
              {loading ? 'Loading announcements...' : 'No announcements are visible yet.'}
            </p>
          ) : null}
          <div className="announcement-list">
            {announcements.map((announcement) => (
              <article className="announcement-item" key={announcement.id}>
                <div className="announcement-meta">
                  <span className="chip" style={chipStyle(audienceColor[announcement.audience])}>
                    <span className="chip-dot" />
                    {audienceLabel[announcement.audience]}
                  </span>
                  {announcement.isPinned ? (
                    <span className="chip" style={chipStyle('amber')}>
                      <IconPin size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                      Pinned
                    </span>
                  ) : null}
                  <span>{formatDateTime(announcement.publishedAt)}</span>
                </div>
                <h2 className="announcement-title">{announcement.title}</h2>
                <p className="announcement-body">{announcement.body}</p>
                {announcement.expiresAt ? (
                  <div className="announcement-expiry">
                    Visible until {formatDate(announcement.expiresAt)}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="announcements-panel" aria-label="Announcement controls">
        {canPublish ? (
          <section className="self-service-section">
            <div className="panel-title-row">
              <div>
                <div className="panel-kicker">Tethr HR</div>
                <h2 className="panel-title">Publish update</h2>
              </div>
              <IconSpeakerphone size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
            </div>
            <form className="config-form" onSubmit={onSubmit}>
              {notice ? <p className="form-success">{notice}</p> : null}
              {formError ? (
                <p className="auth-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="field">
                <label htmlFor="announcement-title">Title</label>
                <input
                  id="announcement-title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="announcement-audience">Audience</label>
                <select
                  id="announcement-audience"
                  value={form.audience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      audience: event.target.value as AnnouncementAudience,
                    }))
                  }
                >
                  {Object.entries(audienceLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="announcement-body">Message</label>
                <textarea
                  id="announcement-body"
                  required
                  value={form.body}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, body: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="announcement-expires">Expires</label>
                <input
                  id="announcement-expires"
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, expiresAt: event.target.value }))
                  }
                />
              </div>
              <label className="checkbox-field">
                <input
                  checked={form.isPinned}
                  type="checkbox"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isPinned: event.target.checked }))
                  }
                />
                Pin this update
              </label>
              <button className="button button-primary" disabled={publishing} type="submit">
                <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </form>
          </section>
        ) : (
          <section className="self-service-section">
            <div className="panel-kicker">Bulletin</div>
            <div className="field-list">
              <div className="field-row">
                <span className="field-label">Newest</span>
                <span className="field-value">
                  {announcements[0] ? formatDate(announcements[0].publishedAt) : '-'}
                </span>
              </div>
              <div className="field-row">
                <span className="field-label">Pinned</span>
                <span className="field-value">{pinnedCount}</span>
              </div>
            </div>
          </section>
        )}
      </aside>
    </main>
  );
};
