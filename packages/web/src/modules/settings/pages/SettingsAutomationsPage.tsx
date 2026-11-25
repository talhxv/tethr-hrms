import { useMutation } from '@apollo/client';
import { IconCopy, IconLock } from '@tabler/icons-react';
import { useEffect, useState, type FormEvent } from 'react';

import { useQuery } from '../../../app/apollo-hooks';
import { StatusChip } from '../../../components/chip/StatusChip';
import { EmptyState } from '../../../components/empty-state/EmptyState';
import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  ONBOARDING_AUTOMATION_SETTINGS_QUERY,
  UPDATE_ONBOARDING_AUTOMATION_SETTINGS_MUTATION,
} from '../../employees/graphql/onboarding-automation.operations';
import { apiOrigin } from '../../employees/onboardingAutomation';

type OnboardingAutomationSettings = {
  readonly webhookUrl: string | null;
  readonly enabled: boolean;
  readonly secretConfigured: boolean;
  readonly callbackPath: string;
  readonly ready: boolean;
};

type SettingsData = { readonly onboardingAutomationSettings: OnboardingAutomationSettings };

/**
 * Wires the workspace to the onboarding workflow (n8n): the webhook "Run
 * automation" posts to, an on/off switch, and the callback address the
 * workflow reports back to. The shared secret lives on the server only — this
 * page shows whether it is set, never its value.
 */
export const SettingsAutomationsPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const canManage = user?.roleKeys.includes('tethrAdmin') === true;
  const { data, loading } = useQuery<SettingsData>(ONBOARDING_AUTOMATION_SETTINGS_QUERY, {
    skip: !canManage,
  });
  const [save, { loading: saving }] = useMutation(UPDATE_ONBOARDING_AUTOMATION_SETTINGS_MUTATION, {
    refetchQueries: [{ query: ONBOARDING_AUTOMATION_SETTINGS_QUERY }],
  });
  const settings = data?.onboardingAutomationSettings ?? null;
  const [webhookUrl, setWebhookUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setWebhookUrl(settings.webhookUrl ?? '');
    setEnabled(settings.enabled);
  }, [settings]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const callbackUrl = `${apiOrigin()}${settings?.callbackPath ?? '/automations/onboarding/callback'}`;
  const dirty =
    settings !== null &&
    (webhookUrl.trim() !== (settings.webhookUrl ?? '') || enabled !== settings.enabled);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    try {
      await save({
        variables: { input: { webhookUrl: webhookUrl.trim() || null, enabled } },
      });
      setNotice('Automation settings saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the automation settings.');
    }
  };

  const onCopyCallback = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setNotice('Callback address copied.');
    } catch {
      setError('Could not copy — select the address and copy it by hand.');
    }
  };

  return (
    <main className="page-frame page-frame-single">
      <div className="employees-content">
        <header className="page-header">
          <div>
            <h2 className="page-title">Automations</h2>
            <p className="page-subtitle">
              Connect the onboarding workflow that drafts and sends offer letters, the employee
              record form, contracts and salary letters.
            </p>
          </div>
        </header>

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

        {!canManage ? (
          <EmptyState
            description="Only a Tethr administrator can connect automations."
            icon={IconLock}
            title="Admins only"
          />
        ) : (
          <section
            aria-labelledby="onboarding-automation-title"
            className="table-shell settings-section-narrow"
          >
            <div className="table-title-row">
              <div className="table-title" id="onboarding-automation-title">
                Onboarding workflow
              </div>
              {settings ? (
                <StatusChip
                  color={settings.ready ? 'green' : 'gray'}
                  label={settings.ready ? 'Connected' : 'Not running'}
                />
              ) : null}
            </div>
            <form className="settings-section-body config-form" onSubmit={(event) => void onSubmit(event)}>
              {loading ? <p className="page-subtitle">Loading…</p> : null}
              {settings && !settings.secretConfigured ? (
                <p className="auth-error" role="status">
                  The server has no shared secret yet (ONBOARDING_AUTOMATION_SECRET). Ask whoever
                  runs the API to set it; until then runs stay off.
                </p>
              ) : null}

              <div className="field">
                <label htmlFor="onboarding-webhook-url">Webhook URL</label>
                <input
                  autoComplete="off"
                  id="onboarding-webhook-url"
                  inputMode="url"
                  name="onboarding-webhook-url"
                  placeholder="https://n8n.example.com/webhook/…"
                  spellCheck={false}
                  type="url"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                />
                <p className="field-hint">
                  The production URL of the n8n Webhook node. “Run automation” posts each run here.
                </p>
              </div>

              <label className="checkbox-field">
                <input
                  checked={enabled}
                  name="onboarding-automation-enabled"
                  type="checkbox"
                  onChange={(event) => setEnabled(event.target.checked)}
                />
                Turn on “Run automation” for this workspace
              </label>

              <div className="field">
                <span className="field-label">Callback address</span>
                <div className="automation-callback">
                  <code>{callbackUrl}</code>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => void onCopyCallback()}
                  >
                    <IconCopy aria-hidden="true" size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                    Copy
                  </button>
                </div>
                <p className="field-hint">
                  The workflow POSTs its result here with the shared secret as a bearer token. Every
                  run also carries this address in its payload.
                </p>
              </div>

              <div>
                <button className="button button-primary" disabled={!dirty || saving} type="submit">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
};
